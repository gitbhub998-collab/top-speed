import { sendModificationRequestEmail, sendMaintenanceRequestEmail } from '../services/emailService.js';
import { createServiceRequest } from '../services/supabaseDataService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MODIFICATION_DURATIONS = new Set(['1_day', '2_days', '3_days', '1_week', '2_weeks', '1_month', 'custom']);
const isText = (value, min = 1, max = 200) => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
const isPhone = (value) => isText(value, 7, 30) && (value.match(/\p{Nd}/gu) || []).length >= 7;
const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const validateContactAndVehicle = (request, { addressMin = 5, addressRequired = true } = {}) => {
  const invalidFields = [];
  if (!isText(request.clientName, 2, 100)) invalidFields.push('clientName');
  if (!isPhone(request.phoneNumber)) invalidFields.push('phoneNumber');
  if (!isText(request.email, 5, 254) || !EMAIL_PATTERN.test(request.email.trim())) invalidFields.push('email');
  if (!isText(request.carType, 1, 100)) invalidFields.push('carType');
  if (addressRequired && !isText(request.address, addressMin, 300)) invalidFields.push('address');
  if (!addressRequired && request.address != null && request.address !== '' && !isText(request.address, 1, 300)) {
    invalidFields.push('address');
  }
  return invalidFields;
};

export const validateMaintenanceRequest = (input) => {
  const request = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const invalidFields = validateContactAndVehicle(request);
  if (!isText(request.issueCategory, 1, 100)) invalidFields.push('issueCategory');
  if (!isText(request.issueDescription, 10, 5000)) invalidFields.push('issueDescription');
  return invalidFields;
};

export const validateModificationRequest = (input) => {
  const request = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const invalidFields = validateContactAndVehicle(request, { addressRequired: false });
  if (request.maintenanceTime != null && request.maintenanceTime !== ''
    && !MODIFICATION_DURATIONS.has(request.maintenanceTime)) {
    invalidFields.push('maintenanceTime');
  }
  if (request.desiredDay != null && request.desiredDay !== '' && !isValidDate(request.desiredDay)) {
    invalidFields.push('desiredDay');
  }
  const modifications = request.modifications;
  if (
    !modifications
    || typeof modifications !== 'object'
    || Array.isArray(modifications)
    || Object.keys(modifications).length === 0
    || Object.keys(modifications).length > 50
    || !Object.values(modifications).some((selected) => selected === true)
  ) {
    invalidFields.push('modifications');
  }
  return invalidFields;
};

const validationMessages = {
  clientName: 'Enter a name between 2 and 100 characters.',
  phoneNumber: 'Enter a phone number with at least 7 digits.',
  email: 'Enter a valid email address.',
  carType: 'Enter your vehicle make and model.',
  address: 'Enter a valid address.',
  maintenanceTime: 'Choose a valid estimated duration.',
  desiredDay: 'Choose a valid preferred date.',
  modifications: 'Select at least one modification.',
  issueCategory: 'Choose an issue category.',
  issueDescription: 'Describe the issue in 10 to 5000 characters.',
};

const sendValidationError = (res, invalidFields) => res.status(400).json({
  success: false,
  message: 'Please correct the highlighted fields and submit again.',
  errors: Object.fromEntries(invalidFields.map((field) => [field, validationMessages[field]])),
});

const normalizeRequest = (request, requestType) => ({
  ...request,
  clientName: request.clientName.trim(),
  phoneNumber: request.phoneNumber.trim(),
  email: request.email.trim().toLowerCase(),
  carType: request.carType.trim(),
  address: typeof request.address === 'string' ? request.address.trim() : '',
  ...(requestType === 'maintenance' && {
    issueCategory: request.issueCategory.trim(),
    issueDescription: request.issueDescription.trim(),
  }),
});

const saveRequestAndNotify = async ({
  res,
  request,
  requestType,
  emailSender,
  emailConfiguredMessage,
  persistRequest = createServiceRequest,
}) => {
  let savedRequest;
  try {
    savedRequest = await persistRequest({
      name: request.clientName,
      email: request.email,
      phone: request.phoneNumber,
      requestType,
      details: JSON.stringify(requestType === 'modification'
        ? {
            carType: request.carType,
            address: request.address,
            maintenanceTime: request.maintenanceTime,
            desiredDay: request.desiredDay,
            modifications: request.modifications,
          }
        : {
            carType: request.carType,
            address: request.address,
            issueCategory: request.issueCategory,
            issueDescription: request.issueDescription,
          }),
      status: 'pending',
    });
  } catch (error) {
    console.error(`Failed to save ${requestType} request:`, error);
    return res.status(503).json({
      success: false,
      message: 'We could not save your request. Please try again.',
    });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error(`Cannot notify the team about ${requestType} request ${savedRequest.id}: SMTP is not configured.`);
    return res.status(202).json({
      success: true,
      requestId: savedRequest.id,
      notificationStatus: 'not_configured',
      message: emailConfiguredMessage,
    });
  }

  try {
    await emailSender(request);
    return res.status(201).json({
      success: true,
      requestId: savedRequest.id,
      notificationStatus: 'sent',
      message: 'Your request was received and confirmation emails were sent.',
    });
  } catch (error) {
    console.error(`Failed to send notifications for ${requestType} request ${savedRequest.id}:`, error);
    return res.status(202).json({
      success: true,
      requestId: savedRequest.id,
      notificationStatus: 'failed',
      message: 'Your request was saved successfully, but we could not send confirmation emails. Our team will follow up.',
    });
  }
};

export const createServiceController = ({
  persistRequest = createServiceRequest,
  sendModificationEmail = sendModificationRequestEmail,
  sendMaintenanceEmail = sendMaintenanceRequestEmail,
} = {}) => ({
  sendModificationRequest: async (req, res) => {
    const request = req.body || {};
    const invalidFields = validateModificationRequest(request);
    if (invalidFields.length) return sendValidationError(res, invalidFields);

    return saveRequestAndNotify({
      res,
      request: normalizeRequest(request, 'modification'),
      requestType: 'modification',
      emailSender: sendModificationEmail,
      emailConfiguredMessage: 'Your request was saved, but email notifications are temporarily unavailable. Our team will follow up.',
      persistRequest,
    });
  },
  sendMaintenanceRequest: async (req, res) => {
    const request = req.body || {};
    const invalidFields = validateMaintenanceRequest(request);
    if (invalidFields.length) return sendValidationError(res, invalidFields);

    return saveRequestAndNotify({
      res,
      request: normalizeRequest(request, 'maintenance'),
      requestType: 'maintenance',
      emailSender: sendMaintenanceEmail,
      emailConfiguredMessage: 'Your request was saved, but email notifications are temporarily unavailable. Our team will follow up.',
      persistRequest,
    });
  },
});

const serviceController = createServiceController();
export const sendModificationRequest = serviceController.sendModificationRequest;
export const sendMaintenanceRequest = serviceController.sendMaintenanceRequest;

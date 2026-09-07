import { sendModificationRequestEmail, sendMaintenanceRequestEmail } from '../services/emailService.js';
import { createServiceRequest } from '../services/supabaseDataService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isText = (value, min = 1, max = 200) => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
const isPhone = (value) => isText(value, 7, 30) && value.replace(/\D/g, '').length >= 7;

export const sendModificationRequest = async (req, res) => {
  try {
    const { clientName, phoneNumber, email, carType, address, maintenanceTime, desiredDay, modifications } = req.body || {};

    // Validate required fields
    if (!isText(clientName, 2, 100) || !isPhone(phoneNumber) || !isText(email, 5, 254) || !isText(carType, 1, 100)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: clientName, phoneNumber, email, carType',
      });
    }

    // Validate email format
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate phone number (basic validation)
    // Check if at least one modification is selected
    if (!modifications || typeof modifications !== 'object' || Array.isArray(modifications) || Object.keys(modifications).length > 50 || !Object.values(modifications).some(val => val === true)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one modification',
      });
    }

    try {
      await createServiceRequest({
        name: clientName,
        email,
        phone: phoneNumber,
        requestType: 'modification',
        details: JSON.stringify({ carType, address, maintenanceTime, desiredDay, modifications }),
        status: 'pending',
      });
    } catch (error) {
      console.error('Failed to save modification request:', error);
      return res.status(503).json({ success: false, message: 'Unable to save your request. Please try again.' });
    }

    // Check email configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email service not configured - skipping email sending');
      return res.status(200).json({
        success: true,
        message: 'Request received (email service not configured)',
        clientEmail: email,
      });
    }

    // Send email
    await sendModificationRequestEmail({
      clientName,
      phoneNumber,
      email,
      carType,
      address,
      maintenanceTime,
      desiredDay,
      modifications,
    });

    return res.status(200).json({
      success: true,
      message: 'Modification request sent successfully! Check your email for confirmation.',
      clientEmail: email,
    });
  } catch (error) {
    console.error('❌ Error sending modification request:', error.message);
    
    // Even if email fails, acknowledge the request was received
    return res.status(200).json({
      success: true,
      message: 'Your request has been received and will be processed by our team',
      note: 'Email service error, but your request is saved. Check backend logs.',
    });
  }
};

export const sendMaintenanceRequest = async (req, res) => {
  try {
    const { clientName, phoneNumber, email, carType, address, issueCategory, issueDescription } = req.body || {};

    // Validate required fields
    if (!isText(clientName, 2, 100) || !isPhone(phoneNumber) || !isText(email, 5, 254) || !isText(carType, 1, 100) || !isText(address, 5, 300) || !isText(issueCategory, 1, 100) || !isText(issueDescription, 10, 5000)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate email format
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate phone number (basic validation)
    // Validate issue description length
    if (issueDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed description (at least 10 characters)',
      });
    }

    try {
      await createServiceRequest({
        name: clientName,
        email,
        phone: phoneNumber,
        requestType: 'maintenance',
        details: JSON.stringify({ carType, address, issueCategory, issueDescription }),
        status: 'pending',
      });
    } catch (error) {
      console.error('Failed to save maintenance request:', error);
      return res.status(503).json({ success: false, message: 'Unable to save your request. Please try again.' });
    }

    // Check email configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email service not configured - skipping email sending');
      return res.status(200).json({
        success: true,
        message: 'Request received (email service not configured)',
        clientEmail: email,
      });
    }

    // Send email
    await sendMaintenanceRequestEmail({
      clientName,
      phoneNumber,
      email,
      carType,
      address,
      issueCategory,
      issueDescription,
    });

    return res.status(200).json({
      success: true,
      message: 'Maintenance request sent successfully! Check your email for confirmation.',
      clientEmail: email,
    });
  } catch (error) {
    console.error('❌ Error sending maintenance request:', error.message);
    
    // Even if email fails, acknowledge the request was received
    return res.status(200).json({
      success: true,
      message: 'Your request has been received and will be processed by our team',
      note: 'Email service error, but your request is saved. Check backend logs.',
    });
  }
};

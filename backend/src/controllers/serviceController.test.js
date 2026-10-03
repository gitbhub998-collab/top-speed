import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createServiceController,
  validateMaintenanceRequest,
  validateModificationRequest,
} from './serviceController.js';

const validRequest = {
  clientName: 'Test Customer',
  phoneNumber: '01234567890',
  email: 'customer@example.com',
  carType: 'Honda Civic',
  address: '123 Main Street',
  issueCategory: 'Engine Problem',
  issueDescription: 'The engine makes a knocking noise while idling.',
};

const validModificationRequest = {
  clientName: 'Test Customer',
  phoneNumber: '+1 (555) 123-4567',
  email: 'customer@example.com',
  carType: 'Honda Civic',
  address: '123 Main Street',
  maintenanceTime: '1_week',
  desiredDay: '2026-10-03',
  modifications: { exhaust: true, engine: false },
};

const createResponse = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('maintenance validation accepts a complete valid request', () => {
  assert.deepEqual(validateMaintenanceRequest(validRequest), []);
});

test('maintenance validation identifies fields rejected by backend constraints', () => {
  assert.deepEqual(validateMaintenanceRequest({
    ...validRequest,
    phoneNumber: '123',
    email: 'bad',
    address: 'A',
    issueDescription: 'Noise',
  }), ['phoneNumber', 'email', 'address', 'issueDescription']);
});

test('maintenance validation rejects empty vehicle and issue categories', () => {
  assert.deepEqual(validateMaintenanceRequest({
    ...validRequest,
    carType: '',
    issueCategory: '',
  }), ['carType', 'issueCategory']);
});

test('modification validation accepts a complete request', () => {
  assert.deepEqual(validateModificationRequest(validModificationRequest), []);
});

test('modification validation accepts the payload sent by the active modification form', () => {
  const { address, maintenanceTime, desiredDay, ...activeFormPayload } = validModificationRequest;
  assert.deepEqual(validateModificationRequest(activeFormPayload), []);
});

test('modification validation accepts phone numbers written with Arabic numerals', () => {
  assert.deepEqual(validateModificationRequest({
    ...validModificationRequest,
    phoneNumber: '٠١٢٣٤٥٦٧٨٩',
  }), []);
});

test('modification validation identifies invalid contact, schedule, date, and selection fields', () => {
  assert.deepEqual(validateModificationRequest({
    ...validModificationRequest,
    clientName: ' ',
    phoneNumber: '123',
    email: 'not-an-email',
    maintenanceTime: 'tomorrow',
    desiredDay: '2026-02-30',
    modifications: { exhaust: false },
  }), ['clientName', 'phoneNumber', 'email', 'maintenanceTime', 'desiredDay', 'modifications']);
});

test('modification validation rejects invalid optional schedule fields when provided', () => {
  assert.deepEqual(validateModificationRequest({
    ...validModificationRequest,
    maintenanceTime: 'tomorrow',
    desiredDay: '2026-02-30',
  }), ['maintenanceTime', 'desiredDay']);
});

test('maintenance and modification validation reject malformed payload types', () => {
  assert.deepEqual(validateMaintenanceRequest(null), [
    'clientName', 'phoneNumber', 'email', 'carType', 'address', 'issueCategory', 'issueDescription',
  ]);
  assert.deepEqual(validateModificationRequest({
    ...validModificationRequest,
    modifications: [],
  }), ['modifications']);
});

test('invalid service requests return field-level errors without saving or sending emails', async () => {
  let saves = 0;
  let emails = 0;
  const controller = createServiceController({
    persistRequest: async () => { saves += 1; },
    sendMaintenanceEmail: async () => { emails += 1; },
  });
  const response = createResponse();

  await controller.sendMaintenanceRequest({ body: { ...validRequest, phoneNumber: '123' } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.errors.phoneNumber, 'Enter a phone number with at least 7 digits.');
  assert.equal(saves, 0);
  assert.equal(emails, 0);
});

test('maintenance request is normalized, persisted, and confirmed by email', async () => {
  const persisted = [];
  const emailed = [];
  const controller = createServiceController({
    persistRequest: async (request) => {
      persisted.push(request);
      return { id: 'maintenance-request-id' };
    },
    sendMaintenanceEmail: async (request) => { emailed.push(request); },
  });
  const response = createResponse();

  await controller.sendMaintenanceRequest({
    body: {
      ...validRequest,
      clientName: '  Test Customer  ',
      phoneNumber: ' 01234567890 ',
      email: ' CUSTOMER@example.com ',
      issueCategory: ' Engine Problem ',
      issueDescription: '  The engine makes a knocking noise while idling.  ',
    },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.requestId, 'maintenance-request-id');
  assert.equal(response.body.notificationStatus, 'sent');
  assert.equal(persisted[0].requestType, 'maintenance');
  assert.equal(persisted[0].name, 'Test Customer');
  assert.equal(persisted[0].email, 'customer@example.com');
  assert.deepEqual(JSON.parse(persisted[0].details), {
    carType: 'Honda Civic',
    address: '123 Main Street',
    issueCategory: 'Engine Problem',
    issueDescription: 'The engine makes a knocking noise while idling.',
  });
  assert.equal(emailed[0].email, 'customer@example.com');
});

test('modification request persists the selected work and reports notification failure accurately', async () => {
  const persisted = [];
  const controller = createServiceController({
    persistRequest: async (request) => {
      persisted.push(request);
      return { id: 'modification-request-id' };
    },
    sendModificationEmail: async () => { throw new Error('mail transport unavailable'); },
  });
  const response = createResponse();
  const { address, maintenanceTime, desiredDay, ...activeFormPayload } = validModificationRequest;

  await controller.sendModificationRequest({ body: activeFormPayload }, response);

  assert.equal(response.statusCode, 202);
  assert.equal(response.body.requestId, 'modification-request-id');
  assert.equal(response.body.notificationStatus, 'failed');
  assert.match(response.body.message, /saved successfully/i);
  assert.equal(persisted[0].requestType, 'modification');
  assert.deepEqual(JSON.parse(persisted[0].details).modifications, validModificationRequest.modifications);
});

test('service requests are not acknowledged when durable persistence fails', async () => {
  const controller = createServiceController({
    persistRequest: async () => { throw new Error('database unavailable'); },
    sendMaintenanceEmail: async () => assert.fail('should not email unsaved request'),
  });
  const response = createResponse();

  await controller.sendMaintenanceRequest({ body: validRequest }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /could not save/i);
});
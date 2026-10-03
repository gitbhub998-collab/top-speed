import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = '';
process.env.SUPABASE_ANON_KEY = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';

const originalWorkingDirectory = process.cwd();
const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'top-speed-auth-test-'));
process.chdir(temporaryDirectory);

const [{ forgotPassword, generateOTP, login, logout, normalizeRegistrationInput, register, resetPassword, verifyOTP, verifyPasswordResetOtp }, { compareUserPassword, createUser, getUserByEmail, startPasswordResetChallenge }, { hashOtp }, { generateToken, isSessionValid, verifyToken }] = await Promise.all([
  import('./authController.js'),
  import('../services/supabaseDataService.js'),
  import('../utils/otp.js'),
  import('../utils/auth.js'),
]);

test.after(async () => {
  process.chdir(originalWorkingDirectory);
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
});

test('registration trims identity fields but preserves password bytes', () => {
  const input = normalizeRegistrationInput({
    name: '  Test User  ',
    email: '  TEST@example.com  ',
    password: '  secure pass  ',
  });

  assert.deepEqual(input, {
    name: 'Test User',
    email: 'test@example.com',
    password: '  secure pass  ',
  });
});

test('registration can retry a pending email without replacing its password or marking it verified', async () => {
  const email = 'pending-auth@example.com';
  const user = await createUser({
    name: 'Pending Auth',
    email,
    password: 'Password123',
    isActive: false,
    isEmailVerified: false,
    otpHash: 'previous-hash',
    otpAttempts: 2,
    otpExpiresAt: new Date(Date.now() + 60000),
  });
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };

  await register({ body: { name: 'Pending Auth', email, password: 'Password123' } }, response);

  assert.equal(response.statusCode, 502);
  assert.match(response.body.error, /verification email/i);
  const stillPending = await getUserByEmail(email);
  assert.equal(stillPending.id, user.id);
  assert.equal(stillPending.isEmailVerified, false);
  assert.equal(stillPending.isActive, false);
  assert.equal(stillPending.passwordHash, user.passwordHash);
  assert.equal(stillPending.otpHash, 'previous-hash');
});

test('registration can replace credentials after an OTP challenge expires or is absent', async () => {
  const email = 'retry-expired-auth@example.com';
  await createUser({
    name: 'Pending Auth',
    email,
    password: 'OldPassword123',
    isActive: false,
    isEmailVerified: false,
  });
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };

  await register({ body: { name: 'Pending Auth', email, password: 'NewPassword123' } }, response);

  assert.equal(response.statusCode, 502);
  const pending = await getUserByEmail(email);
  assert.equal(pending.isEmailVerified, false);
  assert.equal(pending.isActive, false);
  assert.equal(await compareUserPassword(pending.passwordHash, 'NewPassword123'), true);
  assert.equal(await compareUserPassword(pending.passwordHash, 'OldPassword123'), false);
});

test('valid OTP activates the pending account and consumes the challenge once', async () => {
  const email = 'verify-auth@example.com';
  await createUser({
    name: 'Verify Auth',
    email,
    password: 'Password123',
    otpHash: hashOtp('123456'),
    otpExpiresAt: new Date(Date.now() + 60000),
  });
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };

  await verifyOTP({ body: { email, otp: '123456' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(typeof response.body.token, 'string');
  const verified = await getUserByEmail(email);
  assert.equal(verified.isEmailVerified, true);
  assert.equal(verified.isActive, true);
  assert.equal(verified.otpHash, null);
});

test('invalid OTP increments attempts without activating the account', async () => {
  const email = 'invalid-otp-auth@example.com';
  await createUser({
    name: 'Invalid OTP Auth',
    email,
    password: 'Password123',
    otpHash: hashOtp('123456'),
    otpExpiresAt: new Date(Date.now() + 60000),
  });
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };

  await verifyOTP({ body: { email, otp: '654321' } }, response);

  assert.equal(response.statusCode, 401);
  const pending = await getUserByEmail(email);
  assert.equal(pending.otpAttempts, 1);
  assert.equal(pending.isEmailVerified, false);
  assert.equal(pending.isActive, false);
});

test('logout revokes the token but preserves the account email for future login', async () => {
  const email = 'logout-auth@example.com';
  const user = await createUser({
    name: 'Logout Auth',
    email,
    password: 'Password123',
    isActive: true,
    isEmailVerified: true,
  });
  const token = generateToken(user.id, user.role, user.email, user.sessionVersion);
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    send() { this.sent = true; return this; },
  };

  await logout({ user: { userId: user.id } }, response, (error) => { throw error; });

  const retainedUser = await getUserByEmail(email);
  assert.equal(response.statusCode, 204);
  assert.equal(response.sent, true);
  assert.equal(retainedUser.email, email);
  assert.equal(retainedUser.sessionVersion, user.sessionVersion + 1);
  assert.equal(isSessionValid(verifyToken(token), retainedUser), false);
});

const createResponse = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('password reset requests give the same generic response for unknown accounts and mail failures', async () => {
  const user = await createUser({
    name: 'Reset Request User',
    email: 'reset-request@example.com',
    password: 'Password123',
    isActive: true,
    isEmailVerified: true,
  });
  const unknownResponse = createResponse();
  const existingResponse = createResponse();

  await forgotPassword({ body: { email: 'unknown-reset@example.com' } }, unknownResponse);
  await forgotPassword({ body: { email: user.email } }, existingResponse);

  assert.equal(existingResponse.statusCode, unknownResponse.statusCode);
  assert.deepEqual(existingResponse.body, unknownResponse.body);
  assert.doesNotMatch(JSON.stringify(existingResponse.body), /otp|token|reset-request@example/i);
  assert.equal((await getUserByEmail(user.email)).passwordResetOtpHash, null);
});

test('reset OTP grants only one-use reset authorization and password reset revokes sessions', async () => {
  const email = 'reset-flow@example.com';
  const user = await createUser({
    name: 'Reset Flow User',
    email,
    password: 'OldPassword123',
    isActive: true,
    isEmailVerified: true,
    otpHash: 'registration-state-hash',
    otpAttempts: 2,
    otpExpiresAt: new Date(Date.now() + 60000),
  });
  const oldSession = generateToken(user.id, user.role, user.email, user.sessionVersion);
  await startPasswordResetChallenge(user.id, {
    otpHash: hashOtp('123456'),
    expiresAt: new Date(Date.now() + 60000),
  });
  const verifyResponse = createResponse();

  await verifyPasswordResetOtp({ body: { email, otp: '123456' } }, verifyResponse);

  assert.equal(verifyResponse.statusCode, 200);
  assert.equal(typeof verifyResponse.body.resetAuthorization, 'string');
  assert.equal('token' in verifyResponse.body, false);
  assert.equal(JSON.stringify(verifyResponse.body).includes('123456'), false);
  const reusedCode = createResponse();
  await verifyPasswordResetOtp({ body: { email, otp: '123456' } }, reusedCode);
  assert.equal(reusedCode.statusCode, 401);
  const authorization = verifyResponse.body.resetAuthorization;
  const resetResponse = createResponse();
  await resetPassword({ body: {
    resetAuthorization: authorization,
    newPassword: 'NewPassword123',
    confirmPassword: 'NewPassword123',
  } }, resetResponse);

  assert.equal(resetResponse.statusCode, 200);
  const updated = await getUserByEmail(email);
  assert.equal(await compareUserPassword(updated.passwordHash, 'OldPassword123'), false);
  assert.equal(await compareUserPassword(updated.passwordHash, 'NewPassword123'), true);
  assert.equal(updated.isActive, true);
  assert.equal(updated.isEmailVerified, true);
  assert.equal(updated.otpHash, 'registration-state-hash');
  assert.equal(updated.otpAttempts, 2);
  assert.equal(isSessionValid(verifyToken(oldSession), updated), false);

  const oldPasswordLogin = createResponse();
  await login({ body: { email, password: 'OldPassword123' } }, oldPasswordLogin);
  assert.equal(oldPasswordLogin.statusCode, 401);
  const newPasswordLogin = createResponse();
  await login({ body: { email, password: 'NewPassword123' } }, newPasswordLogin);
  assert.equal(newPasswordLogin.statusCode, 200);
  assert.equal(typeof newPasswordLogin.body.token, 'string');

  const replay = createResponse();
  await resetPassword({ body: {
    resetAuthorization: authorization,
    newPassword: 'OtherPassword123',
    confirmPassword: 'OtherPassword123',
  } }, replay);
  assert.equal(replay.statusCode, 401);
  assert.equal(await compareUserPassword(updated.passwordHash, 'NewPassword123'), true);
});

test('reset endpoints reject expired OTPs, forged authorization, and identity-only claims', async () => {
  const email = 'reset-invalid@example.com';
  const user = await createUser({
    name: 'Reset Invalid User',
    email,
    password: 'OldPassword123',
    isActive: true,
    isEmailVerified: true,
  });
  await startPasswordResetChallenge(user.id, {
    otpHash: hashOtp('123456'),
    expiresAt: new Date(Date.now() - 1),
  });

  const expired = createResponse();
  await verifyPasswordResetOtp({ body: { email, otp: '123456' } }, expired);
  assert.equal(expired.statusCode, 401);

  for (const body of [
    { email, userId: user.id, otpVerified: true, newPassword: 'NewPassword123', confirmPassword: 'NewPassword123' },
    { email, userId: user.id, newPassword: 'NewPassword123', confirmPassword: 'NewPassword123' },
    { resetAuthorization: 'forged', newPassword: 'NewPassword123', confirmPassword: 'NewPassword123' },
  ]) {
    const response = createResponse();
    await resetPassword({ body }, response);
    assert.equal(response.statusCode, 401);
  }

  const unchanged = await getUserByEmail(email);
  assert.equal(await compareUserPassword(unchanged.passwordHash, 'OldPassword123'), true);
});

test('incorrect reset OTPs consume a bounded attempt budget without changing account state', async () => {
  const email = 'reset-wrong-otp@example.com';
  const user = await createUser({
    name: 'Reset Wrong OTP User',
    email,
    password: 'Password123',
    isActive: true,
    isEmailVerified: true,
  });
  await startPasswordResetChallenge(user.id, {
    otpHash: hashOtp('123456'),
    expiresAt: new Date(Date.now() + 60000),
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = createResponse();
    await verifyPasswordResetOtp({ body: { email, otp: '654321' } }, response);
    assert.equal(response.statusCode, attempt === 4 ? 429 : 401);
  }

  const invalidated = await getUserByEmail(email);
  assert.equal(invalidated.passwordResetOtpHash, null);
  assert.equal(invalidated.isActive, true);
  assert.equal(invalidated.isEmailVerified, true);
});

test('password reset OTP generation does not depend on Math.random', () => {
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('Math.random must not generate reset OTPs'); };
  try {
    assert.match(generateOTP(), /^\d{6}$/);
  } finally {
    Math.random = originalRandom;
  }
});
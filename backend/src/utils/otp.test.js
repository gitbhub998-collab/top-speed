import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';

const { hashOtp, verifyOtpHash } = await import('./otp.js');

test('OTP hashes do not expose the six-digit code and verify only the matching code', () => {
  const hash = hashOtp('123456');

  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, '123456');
  assert.equal(verifyOtpHash('123456', hash), true);
  assert.equal(verifyOtpHash('123457', hash), false);
  assert.equal(verifyOtpHash('123456', 'invalid'), false);
});
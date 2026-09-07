import test from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, verifyToken, isSessionValid } from './auth.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';

test('accepts a token only when its session version matches the user', () => {
  const token = generateToken('user-1', 'user', 'user@example.com', 3);
  const decoded = verifyToken(token);

  assert.equal(decoded.sessionVersion, 3);
});

test('does not accept a token from an older session version', () => {
  const token = generateToken('user-1', 'user', 'user@example.com', 2);
  const decoded = verifyToken(token);

  assert.equal(isSessionValid(decoded, {
    id: 'user-1',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    sessionVersion: 3,
  }), false);
});

test('rejects a token when its role no longer matches the user', () => {
  const token = generateToken('user-1', 'user', 'user@example.com', 3);
  const decoded = verifyToken(token);

  assert.equal(isSessionValid(decoded, {
    id: 'user-1',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    sessionVersion: 3,
  }), false);
});

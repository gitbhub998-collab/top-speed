import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminUser, normalizeAdminEmailList } from './admin.js';

test('detects configured admin emails as admins', () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = 'admin@example.com, second@example.com';

  try {
    assert.equal(isAdminUser({ role: 'user', email: 'admin@example.com' }), true);
    assert.equal(isAdminUser({ role: 'user', email: 'SECOND@EXAMPLE.COM' }), true);
    assert.equal(isAdminUser({ role: 'user', email: 'visitor@example.com' }), false);
    assert.equal(isAdminUser({ role: 'admin', email: 'visitor@example.com' }), true);
    assert.deepEqual(normalizeAdminEmailList(' admin@example.com , second@example.com '), ['admin@example.com', 'second@example.com']);
  } finally {
    if (previous === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = previous;
    }
  }
});

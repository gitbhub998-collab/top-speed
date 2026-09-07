import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { createUser, getUserByEmail, updateUser } from './supabaseDataService.js';

const storePath = path.resolve(process.cwd(), 'data', 'users.json');

const resetStore = async () => {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, '[]', 'utf8');
};

test('creates and retrieves a user through the local fallback store', async () => {
  await resetStore();

  const created = await createUser({
    name: 'Fallback User',
    email: 'fallback@example.com',
    password: 'Password123',
    role: 'user',
    isActive: false,
    isEmailVerified: false,
    otp: '123456',
    otpExpiresAt: new Date(Date.now() + 60000),
    phone: '+15551234567',
    avatarUrl: 'https://example.com/avatar.jpg',
    preferences: {
      theme: 'dark',
      language: 'en',
      motion: 'reduced',
      notifications: { serviceUpdates: false, productNews: true },
    },
  });

  assert.equal(created.email, 'fallback@example.com');
  assert.equal(created.isEmailVerified, false);
  assert.equal(created.phone, '+15551234567');
  assert.equal(created.preferences.theme, 'dark');

  const found = await getUserByEmail('FALLBACK@EXAMPLE.COM');
  assert.ok(found);
  assert.equal(found.id, created.id);

  const updated = await updateUser(created.id, {
    isEmailVerified: true,
    isActive: true,
    otp: null,
    otpExpiresAt: null,
    phone: '+15557654321',
    preferences: {
      theme: 'system',
      language: 'ar',
      motion: 'full',
      notifications: { serviceUpdates: true, productNews: false },
    },
  });
  assert.equal(updated.isEmailVerified, true);
  assert.equal(updated.isActive, true);
  assert.equal(updated.otp, null);
  assert.equal(updated.phone, '+15557654321');
  assert.equal(updated.preferences.language, 'ar');
});

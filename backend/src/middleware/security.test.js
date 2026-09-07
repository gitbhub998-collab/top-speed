import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from './security.js';

const createResponse = () => ({
  headers: {},
  statusCode: 200,
  set(name, value) {
    this.headers[name] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  },
});

test('rate limiter blocks requests after the configured threshold', async () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 1 });
  const firstResponse = createResponse();
  const secondResponse = createResponse();
  const request = { ip: '198.51.100.10', baseUrl: '/api/auth', path: '/login' };
  let nextCalls = 0;

  await limiter(request, firstResponse, () => { nextCalls += 1; });
  await limiter(request, secondResponse, () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(secondResponse.statusCode, 429);
  assert.equal(secondResponse.payload.error, 'Too many requests. Please try again later.');
});
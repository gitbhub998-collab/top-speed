import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

process.env.NODE_ENV = 'production';

const [
  { default: serviceHandler },
  { default: backendCatchAll },
  { default: rootCatchAll },
] = await Promise.all([
  import('../api/service/[action].js'),
  import('../api/[...path].js'),
  import('../../api/[...path].js'),
]);

const defaultHandler = serviceHandler;

const startServer = async (handler = defaultHandler) => {
  const server = createServer((req, res) => {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };
    res.json = (body) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
      return res;
    };

    Promise.resolve(handler(req, res)).catch((error) => {
      res.statusCode = 500;
      res.end(error.message);
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server;
};

const withServer = async (callback, handler) => {
  const server = await startServer(handler);
  const origin = `http://127.0.0.1:${server.address().port}`;

  try {
    await callback(origin);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const frontendOrigin = 'https://top-speed-bm.vercel.app';

test('service preflight allows production frontend POST requests', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/send-maintenance-request`, {
      method: 'OPTIONS',
      headers: {
        Origin: frontendOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin);
    assert.match(response.headers.get('access-control-allow-methods'), /POST/);
  });
});

test('service handler normalizes Vercel path shapes without persisting invalid requests', async () => {
  await withServer(async (origin) => {
    for (const path of [
      '/send-modification-request',
      '/service/send-modification-request',
      '/api/service/send-modification-request',
    ]) {
      const response = await fetch(`${origin}${path}`, {
        method: 'POST',
        headers: {
          Origin: frontendOrigin,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });

      assert.equal(response.status, 400, `${path} must reach Express validation`);
      assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin);
    }
  });
});

test('root and standalone backend catch-alls forward service preflight to Express', async () => {
  for (const { handler, path } of [
    { handler: backendCatchAll, path: '/service/send-maintenance-request' },
    { handler: rootCatchAll, path: '/api/service/send-maintenance-request' },
  ]) {
    await withServer(async (origin) => {
      const response = await fetch(`${origin}${path}`, {
        method: 'OPTIONS',
        headers: {
          Origin: frontendOrigin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      });

      assert.equal(response.status, 204, path);
      assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin, path);
    }, handler);
  }
});
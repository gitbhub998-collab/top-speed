let backendHandler;

export default async function authHandler(req, res) {
  backendHandler ??= (await import('../../src/server.js')).default;

  if (typeof req.url === 'string' && !req.url.startsWith('/api/auth/')) {
    const queryIndex = req.url.indexOf('?');
    const path = queryIndex === -1 ? req.url : req.url.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    req.url = `/api/auth${path.startsWith('/') ? path : `/${path}`}${query}`;
  }

  return backendHandler(req, res);
}

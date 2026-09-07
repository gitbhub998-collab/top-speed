let backendHandler;

export default async function apiHandler(req, res) {
  backendHandler ??= (await import('../backend/src/server.js')).default;

  if (typeof req.url === 'string' && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return backendHandler(req, res);
}

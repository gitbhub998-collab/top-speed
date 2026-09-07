let backendHandler;

export default async function apiHandler(req, res) {
  backendHandler ??= (await import('../src/server.js')).default;

  // Vercel catch-all functions can receive the path without the /api prefix.
  // Express routes are mounted under /api, so normalize both deployment shapes.
  if (typeof req.url === 'string' && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return backendHandler(req, res);
}

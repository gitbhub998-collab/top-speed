let backendHandler;

export default async function serviceHandler(req, res) {
  backendHandler ??= (await import('../../src/server.js')).default;

  if (typeof req.url === 'string' && !req.url.startsWith('/api/service/')) {
    const queryIndex = req.url.indexOf('?');
    const path = queryIndex === -1 ? req.url : req.url.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    const servicePath = path === '/service' || path === '/api/service'
      ? '/api/service'
      : path.startsWith('/service/')
        ? `/api${path}`
        : `/api/service${path.startsWith('/') ? path : `/${path}`}`;
    req.url = `${servicePath}${query}`;
  }

  return backendHandler(req, res);
}
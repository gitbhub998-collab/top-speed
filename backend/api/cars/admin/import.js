let backendHandler;

export default async function carAdminImportHandler(req, res) {
  backendHandler ??= (await import('../../../src/server.js')).default;

  // Vercel routes /api/cars/admin/import here; Express expects the same path.
  if (typeof req.url === 'string' && !req.url.startsWith('/api/cars/admin/import')) {
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    req.url = `/api/cars/admin/import${query}`;
  }

  return backendHandler(req, res);
}

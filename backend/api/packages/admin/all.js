let backendHandler;

export default async function packagesAdminAllHandler(req, res) {
  backendHandler ??= (await import('../../../src/server.js')).default;

  // Vercel routes /api/packages/admin/all here; Express expects the same path.
  if (typeof req.url === 'string' && !req.url.startsWith('/api/packages/admin/all')) {
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    req.url = `/api/packages/admin/all${query}`;
  }

  return backendHandler(req, res);
}

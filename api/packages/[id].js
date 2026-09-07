let backendHandler;

export default async function packageHandler(req, res) {
  backendHandler ??= (await import('../../backend/src/server.js')).default;
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
  req.url = `/api/packages/${req.query?.id || ''}${query}`;
  return backendHandler(req, res);
}

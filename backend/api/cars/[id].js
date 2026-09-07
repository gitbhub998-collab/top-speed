let backendHandler;

export default async function carHandler(req, res) {
  backendHandler ??= (await import('../../src/server.js')).default;
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
  req.url = `/api/cars/${req.query?.id || ''}${query}`;
  return backendHandler(req, res);
}

let backendHandler;

export default async function modificationHandler(req, res) {
  backendHandler ??= (await import('../../src/server.js')).default;
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
  req.url = `/api/modifications/${req.query?.id || ''}${query}`;
  return backendHandler(req, res);
}

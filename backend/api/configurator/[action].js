let backendHandler;

export default async function configuratorHandler(req, res) {
  backendHandler ??= (await import('../../src/server.js')).default;
  const queryIndex = req.url?.indexOf('?') ?? -1;
  const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
  req.url = `/api/configurator/${req.query?.action || ''}${query}`;
  return backendHandler(req, res);
}

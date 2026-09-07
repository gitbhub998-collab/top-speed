let backendHandler;

export default async function apiHandler(req, res) {
  backendHandler ??= (await import('../src/server.js')).default;
  return backendHandler(req, res);
}

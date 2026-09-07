let backendHandler;

export default async function apiHandler(req, res) {
	const requestPath = req.url?.split('?')[0];
	if (requestPath === '/' || requestPath === '/api/health' || requestPath === '/health') {
		return res.status(200).json({ status: 'Backend is running' });
	}

	backendHandler ??= (await import('../backend/src/server.js')).default;
	return backendHandler(req, res);
}

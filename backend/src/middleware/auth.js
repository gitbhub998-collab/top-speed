import { verifyToken, isSessionValid } from '../utils/auth.js';
import { getUserById } from '../services/supabaseDataService.js';
import { timingSafeEqual } from 'node:crypto';

export const authMiddleware = async (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const user = await getUserById(decoded.userId);
    if (!isSessionValid(decoded, user)) {
      return res.status(401).json({ error: 'Session is no longer valid' });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      sessionVersion: user.sessionVersion ?? 0,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  if (!authorization) return next();

  return authMiddleware(req, res, next);
};

export const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

export const adminBootstrapMiddleware = (req, res, next) => {
  if (process.env.ADMIN_BOOTSTRAP_ENABLED !== 'true') {
    return res.status(404).json({ error: 'Not found' });
  }

  const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  const providedSecret = req.headers['x-admin-bootstrap-secret'];

  if (!configuredSecret || typeof providedSecret !== 'string') {
    return res.status(404).json({ error: 'Not found' });
  }

  const expected = Buffer.from(configuredSecret);
  const provided = Buffer.from(providedSecret);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return res.status(404).json({ error: 'Not found' });
  }

  return next();
};

export const errorHandler = (err, req, res, next) => {
  console.error('Request failed:', { method: req.method, path: req.path, error: err });
  const isMalformedBody = err instanceof SyntaxError && err.status === 400 && Object.prototype.hasOwnProperty.call(err, 'body');
  const status = isMalformedBody ? 400 : (err.status || 500);
  res.status(status).json({
    error: isMalformedBody ? 'Invalid JSON body' : (status < 500 ? err.message : 'Internal server error'),
  });
};

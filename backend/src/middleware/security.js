const buckets = new Map();
const REDIS_TIMEOUT_MS = 1_000;

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000);

cleanupInterval.unref?.();

export const rateLimit = ({ windowMs, max, message = 'Too many requests. Please try again later.' }) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl}${req.path}`;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    return applyDistributedLimit({ key, redisUrl, redisToken, windowMs, max })
      .then((allowed) => {
        if (allowed) return next();
        res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
        return res.status(429).json({ error: message });
      })
      .catch((error) => {
        console.error('Distributed rate limiter unavailable; using local fallback:', error);
        return applyLocalLimit({ key, windowMs, max, message, req, res, next });
      });
  }

  return applyLocalLimit({ key, windowMs, max, message, req, res, next });
};

const applyLocalLimit = ({ key, windowMs, max, message, res, next }) => {
  const now = Date.now();
  const current = buckets.get(key);
  const bucket = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  res.set('RateLimit-Limit', String(max));
  res.set('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
  res.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > max) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: message });
  }

  return next();
};

const applyDistributedLimit = async ({ key, redisUrl, redisToken, windowMs, max }) => {
  const redisKey = `top-speed:rate-limit:${key}`;
  const response = await fetch(`${redisUrl.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['EXPIRE', redisKey, Math.ceil(windowMs / 1000)],
    ]),
    signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Upstash returned HTTP ${response.status}`);
  const results = await response.json();
  const count = Number(results?.[0]?.result);
  if (!Number.isFinite(count)) throw new Error('Invalid Upstash response');
  return count <= max;
};

export const securityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  });

  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return next();
};

export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
export const registrationRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
export const otpRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });
export const publicSubmissionRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
export const adminBootstrapRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 3 });
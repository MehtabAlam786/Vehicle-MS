const buckets = new Map();
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}, 60 * 1000);
cleanup.unref?.();

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, message = "Too many requests. Please try again later." } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.method}:${req.path}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) bucket = { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - bucket.count));
    if (bucket.count > max) return res.status(429).json({ message });
    next();
  };
}

export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many authentication attempts. Please try again in 15 minutes." });
export const apiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 180 });

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

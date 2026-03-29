/**
 * In-memory per-IP sliding window rate limiter.
 * No external dependencies — replaces the broken Upstash integration.
 *
 * Config: 100 requests per 60-second window per IP.
 */

const WINDOW_MS = 60 * 1000;   // 60 seconds
const MAX_REQUESTS = 200;      // max hits per window per IP
const CLEANUP_INTERVAL = 5 * 60 * 1000; // purge stale buckets every 5 min

// Map<string, { timestamps: number[] }>
const ipBuckets = new Map();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of ipBuckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
    if (bucket.timestamps.length === 0) ipBuckets.delete(ip);
  }
}, CLEANUP_INTERVAL).unref(); // .unref() so it doesn't keep the process alive

/**
 * Extract the client IP from the request, handling proxies (Render, Nginx, etc.)
 */
const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; the first is the real client
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const rateLimiter = (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();

  if (!ipBuckets.has(ip)) {
    ipBuckets.set(ip, { timestamps: [] });
  }

  const bucket = ipBuckets.get(ip);

  // Drop timestamps outside the current window
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = bucket.timestamps[0];
    const retryAfterSec = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000);

    res.set("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAfterSeconds: retryAfterSec,
    });
  }

  bucket.timestamps.push(now);
  next();
};

export default rateLimiter;

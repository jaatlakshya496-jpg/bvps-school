import type { NextFunction, Request, Response } from "express";

/**
 * Chhoti in-memory sliding-window rate limiter.
 *
 * Render par API single instance par chalti hai, isliye external store (Redis)
 * ki zaroorat nahi. Multi-instance deployment ho toh ise Redis/Upstash par
 * shift karna hoga — warna har instance apna alag counter rakhega.
 */
type Bucket = { count: number; resetAt: number };

type LimiterOptions = {
  windowMs: number;
  max: number;
  /** Prefix se alag-alag endpoints ke buckets alag rehte hain. */
  name: string;
  /** Custom key (default: client IP). */
  key?: (req: Request) => string;
  /** Standard `Retry-After` header bhejna hai? Default true. */
  retryAfter?: boolean;
  /** Test/debug ke liye. */
  skip?: (req: Request) => boolean;
};

const stores = new Map<string, Map<string, Bucket>>();
let lastSweep = Date.now();

function sweep(now: number) {
  // Har request par poora map scan na karo — 5 minute me ek baar kaafi hai.
  if (now - lastSweep < 5 * 60_000) return;
  lastSweep = now;
  for (const [name, buckets] of stores) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
    if (!buckets.size) stores.delete(name);
  }
}

export function clientIp(req: Request): string {
  // `trust proxy` set hai, isliye `req.ip` Render ke proxy ke peeche asli IP deta hai.
  return req.ip || req.socket.remoteAddress || "unknown";
}

function normalizeKey(req: Request, name: string, key?: (req: Request) => string) {
  const raw = key ? key(req) : clientIp(req);
  return `${name}:${raw}`.slice(0, 300);
}

export function createRateLimiter(options: LimiterOptions) {
  const { windowMs, max, name, key, retryAfter = true } = options;

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    if (options.skip?.(req)) {
      next();
      return;
    }

    const now = Date.now();
    sweep(now);

    let buckets = stores.get(name);
    if (!buckets) {
      buckets = new Map();
      stores.set(name, buckets);
    }

    const bucketKey = normalizeKey(req, name, key);
    const existing = buckets.get(bucketKey);
    const bucket =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : existing;

    bucket.count += 1;
    buckets.set(bucketKey, bucket);

    const remaining = Math.max(0, max - bucket.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      const seconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      if (retryAfter) res.setHeader("Retry-After", String(seconds));
      res.status(429).json({
        success: false,
        error: `Too many requests. Please try again in ${seconds} second(s).`,
      });
      return;
    }

    next();
  };
}

/** Login brute-force ke liye: same IP + same email par alag-alag limits. */
export const loginIpLimiter = createRateLimiter({
  name: "admin-login-ip",
  windowMs: 15 * 60_000,
  max: 10,
});

export const loginEmailLimiter = createRateLimiter({
  name: "admin-login-email",
  windowMs: 15 * 60_000,
  max: 5,
  key: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return email || clientIp(req);
  },
});

/** Public forms: ek IP se 15 minute me 8 submissions. */
export const formLimiter = createRateLimiter({
  name: "public-form",
  windowMs: 15 * 60_000,
  max: 10,
});

/** Chatbot: Groq cost aur abuse control. */
export const chatLimiter = createRateLimiter({
  name: "chat",
  windowMs: 5 * 60_000,
  max: 30,
});

/** Fee/session unlock attempts (passcode brute force). */
export const passcodeLimiter = createRateLimiter({
  name: "admin-passcode",
  windowMs: 15 * 60_000,
  max: 8,
});

/** Tests ke liye saare counters clear karo. */
export function resetRateLimits() {
  stores.clear();
  lastSweep = Date.now();
}

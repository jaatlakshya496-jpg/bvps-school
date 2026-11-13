import crypto from "node:crypto";
import type { CookieOptions, Request, Response } from "express";

/**
 * Admin session: HttpOnly, Secure, SameSite=None cookie + signed stateless token.
 *
 * Pehle login endpoint ADMIN_SECRET ko hi token bana kar response me bhejta tha
 * aur frontend use localStorage me rakhta tha. Us design me:
 *  - secret browser ke JavaScript se readable tha (XSS par steal ho sakta tha),
 *  - token kabhi expire nahi hota tha,
 *  - logout ka koi server-side effect nahi tha.
 *
 * Ab browser sirf opaque signed session token rakhta hai (HttpOnly cookie),
 * token 8 ghante me expire hota hai (ya 30 din, jab owner ne "Remember this
 * device" select kiya ho), logout par `jti` revoke hota hai, aur
 * state-changing requests ke liye alag CSRF token chahiye.
 */
export const SESSION_COOKIE_NAME = "bvps_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours (default session lifetime)
export const REMEMBERED_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days ("remember this device")
const MAX_TOKEN_LENGTH = 4096;

export type AdminSession = {
  email: string;
  csrf: string;
  jti: string;
  iat: number;
  exp: number;
};

const revoked = new Map<string, number>();

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  // Production me fallback nahi — sirf ADMIN_SESSION_SECRET hi session signing
  // ke liye use hota hai. Dev/local me ADMIN_SECRET bhi allowed hai.
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return process.env.ADMIN_SECRET ?? "";
  return "";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // Hash dono ko fixed length me la kar timingSafeEqual use karo.
  const ah = crypto.createHash("sha256").update(a).digest();
  const bh = crypto.createHash("sha256").update(b).digest();
  return ah.length === bh.length && crypto.timingSafeEqual(ah, bh);
}

/** Plain password/secret compare ke liye bhi constant-time helper. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  return safeEqual(a, b);
}

/**
 * Admin session ki lifetime decide karta hai. Default 8 ghante; sirf
 * "Remember this device" ke liye (login me exact boolean `true` bheja gaya ho)
 * 30 din. Truthy strings / numbers kabhi 30-day session enable nahi karte —
 * server hi strict check karta hai (sirf exact `true` accepted).
 */
export function resolveSessionTtlMs(remember: unknown): number {
  return remember === true ? REMEMBERED_SESSION_TTL_MS : SESSION_TTL_MS;
}

export function createAdminSession(
  email: string,
  remember: boolean = false,
): { token: string; session: AdminSession; ttlMs: number } | null {
  const secret = sessionSecret();
  if (!secret) return null;

  const ttlMs = resolveSessionTtlMs(remember);
  const now = Date.now();
  const session: AdminSession = {
    email,
    csrf: crypto.randomBytes(32).toString("hex"),
    jti: crypto.randomBytes(16).toString("hex"),
    iat: now,
    exp: now + ttlMs,
  };
  const payload = b64url(JSON.stringify(session));
  const token = `${payload}.${sign(payload, secret)}`;
  return { token, session, ttlMs };
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const secret = sessionSecret();
  if (!secret) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, sign(payload, secret))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") return null;
  const session = parsed as Partial<AdminSession>;
  if (
    typeof session.email !== "string" ||
    typeof session.csrf !== "string" ||
    typeof session.jti !== "string" ||
    typeof session.exp !== "number" ||
    typeof session.iat !== "number"
  ) {
    return null;
  }

  const now = Date.now();
  if (session.exp <= now || session.iat > now + 60_000) return null;
  if (revoked.has(session.jti)) return null;

  return session as AdminSession;
}

export function revokeSession(session: AdminSession | null | undefined) {
  if (!session) return;
  revoked.set(session.jti, session.exp);
  // Expired entries cleanup (chhota map, par unbounded grow na ho).
  if (revoked.size > 500) {
    const now = Date.now();
    for (const [jti, exp] of revoked) {
      if (exp <= now) revoked.delete(jti);
    }
  }
}

export function readSession(req: Request): AdminSession | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return verifySessionToken(cookies?.[SESSION_COOKIE_NAME]);
}

export function sessionCookieOptions(ttlMs: number = SESSION_TTL_MS): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // Cross-site frontend (Vercel) -> API (Render) ke liye SameSite=None +
    // Secure zaroori hai. Local HTTP dev par `lax` chalta hai.
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    // maxAge express me milliseconds me hota hai; Set-Cookie Max-Age header
    // isi ko seconds me convert karke deta hai (8h = 28800s, 30 din = 2592000s).
    maxAge: ttlMs,
  };
}

export function setSessionCookie(res: Response, token: string, ttlMs: number = SESSION_TTL_MS) {
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(ttlMs));
}

export function clearSessionCookie(res: Response) {
  const opts = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });
}

/** Cookie-auth wali state-changing request ke liye CSRF token match. */
export function hasValidCsrf(req: Request, session: AdminSession): boolean {
  const header = req.headers["x-csrf-token"];
  const token = Array.isArray(header) ? header[0] : header;
  return typeof token === "string" && token.length > 0 && safeEqual(token, session.csrf);
}

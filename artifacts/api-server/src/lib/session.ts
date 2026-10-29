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
 * token 8 ghante me expire hota hai, logout par `jti` revoke hota hai, aur
 * state-changing requests ke liye alag CSRF token chahiye.
 */
export const SESSION_COOKIE_NAME = "bvps_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
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
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SECRET || "";
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

export function createAdminSession(email: string): { token: string; session: AdminSession } | null {
  const secret = sessionSecret();
  if (!secret) return null;

  const now = Date.now();
  const session: AdminSession = {
    email,
    csrf: crypto.randomBytes(32).toString("hex"),
    jti: crypto.randomBytes(16).toString("hex"),
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const payload = b64url(JSON.stringify(session));
  const token = `${payload}.${sign(payload, secret)}`;
  return { token, session };
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

export function sessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // Cross-site frontend (Vercel) -> API (Render) ke liye SameSite=None +
    // Secure zaroori hai. Local HTTP dev par `lax` chalta hai.
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
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

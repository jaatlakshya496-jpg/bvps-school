import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  REMEMBERED_SESSION_TTL_MS,
  createAdminSession,
  verifySessionToken,
  revokeSession,
  readSession,
  sessionCookieOptions,
  setSessionCookie,
} from "./session";
import type { CookieOptions, Request, Response } from "express";

const BASE_TIME = new Date("2026-11-09T10:00:00Z");

describe("admin session", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
    process.env.ADMIN_SESSION_SECRET = "test-session-secret";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a session that verifies correctly", () => {
    const created = createAdminSession("admin@bvps.edu");
    expect(created).not.toBeNull();
    expect(created!.session.email).toBe("admin@bvps.edu");
    expect(created!.session.csrf).toBeTruthy();
    expect(created!.session.jti).toBeTruthy();
    expect(created!.session.exp).toBeGreaterThan(Date.now());

    const verified = verifySessionToken(created!.token);
    expect(verified).not.toBeNull();
    expect(verified!.email).toBe("admin@bvps.edu");
    expect(verified!.csrf).toBe(created!.session.csrf);
  });

  it("creates a default session valid for 8 hours", () => {
    const created = createAdminSession("admin@bvps.edu");
    expect(created).not.toBeNull();
    expect(created!.ttlMs).toBe(SESSION_TTL_MS);
    expect(created!.session.exp - created!.session.iat).toBe(SESSION_TTL_MS);
  });

  it("keeps the default 8-hour session when remember is false", () => {
    const created = createAdminSession("admin@bvps.edu", false);
    expect(created).not.toBeNull();
    expect(created!.ttlMs).toBe(SESSION_TTL_MS);
  });

  it("creates a 30-day session when remember is exactly true", () => {
    const created = createAdminSession("admin@bvps.edu", true);
    expect(created).not.toBeNull();
    expect(created!.ttlMs).toBe(REMEMBERED_SESSION_TTL_MS);
    expect(created!.session.exp - created!.session.iat).toBe(REMEMBERED_SESSION_TTL_MS);
  });

  it("does not enable the 30-day remember session for non-boolean values", () => {
    // Sirf exact boolean `true` hi 30 din permit karta hai; truthy strings / numbers
    // (ya null) kabhi "remember" nahi enable karte — default 8-hour session hi banta hai.
    expect(createAdminSession("admin@bvps.edu", "true" as unknown as boolean)!.ttlMs).toBe(SESSION_TTL_MS);
    expect(createAdminSession("admin@bvps.edu", 1 as unknown as boolean)!.ttlMs).toBe(SESSION_TTL_MS);
    expect(createAdminSession("admin@bvps.edu", null as unknown as boolean)!.ttlMs).toBe(SESSION_TTL_MS);
    expect(createAdminSession("admin@bvps.edu", undefined)!.ttlMs).toBe(SESSION_TTL_MS);
  });

  it("rejects a tampered / invalid token", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    const parts = created.token.split(".");
    const tampered = `${parts[0]}.${"b".repeat(43)}`;
    expect(verifySessionToken(tampered)).toBeNull();
    expect(verifySessionToken("garbage.token")).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("rejects an expired session", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    vi.setSystemTime(new Date(created.session.exp + 1000));
    expect(verifySessionToken(created.token)).toBeNull();
  });

  it("rejects a session once revoked", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    revokeSession(created.session);
    expect(verifySessionToken(created.token)).toBeNull();
  });

  it("reads the session from the HttpOnly cookie", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    const req = { cookies: { [SESSION_COOKIE_NAME]: created.token } } as unknown as Request;
    const session = readSession(req);
    expect(session?.jti).toBe(created.session.jti);
  });

  it("expires a short (8h) session after 8 hours while a remembered session is still valid", () => {
    const short = createAdminSession("admin@bvps.edu")!;
    expect(short.session.exp).toBe(BASE_TIME.getTime() + SESSION_TTL_MS);

    // Short session: 8 ghante baad verify fail ho jaata hai.
    vi.setSystemTime(new Date(short.session.exp));
    expect(verifySessionToken(short.token)).toBeNull();

    // Remembered session: 8 ghante baad bhi toh abhi valid hai (30 din ki hai).
    const remembered = createAdminSession("admin@bvps.edu", true)!;
    vi.setSystemTime(new Date(short.session.exp));
    expect(verifySessionToken(remembered.token)).not.toBeNull();
  });

  it("expires a remembered session after 30 days", () => {
    const remembered = createAdminSession("admin@bvps.edu", true)!;
    expect(remembered.session.exp).toBe(BASE_TIME.getTime() + REMEMBERED_SESSION_TTL_MS);

    // 30 din baad session expire ho jaati hai.
    vi.setSystemTime(new Date(remembered.session.exp + 1000));
    expect(verifySessionToken(remembered.token)).toBeNull();

    // Expiry se pehle — toh valid tha.
    vi.setSystemTime(new Date(remembered.session.exp - 1000));
    expect(verifySessionToken(remembered.token)).not.toBeNull();
  });

  it("allows a remembered session to still be revoked", () => {
    const remembered = createAdminSession("admin@bvps.edu", true)!;
    revokeSession(remembered.session);
    expect(verifySessionToken(remembered.token)).toBeNull();
  });

  describe("session cookie options", () => {
    const prevNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = prevNodeEnv;
    });

    it("uses the default 8h lifetime with HttpOnly + Secure + SameSite=None flags in production", () => {
      process.env.NODE_ENV = "production";
      const opts = sessionCookieOptions();
      expect(opts.httpOnly).toBe(true);
      expect(opts.secure).toBe(true);
      expect(opts.sameSite).toBe("none");
      expect(opts.path).toBe("/");
      expect(opts.maxAge).toBe(SESSION_TTL_MS);
    });

    it("follows the remembered 30-day lifetime for the cookie maxAge", () => {
      process.env.NODE_ENV = "production";
      const opts = sessionCookieOptions(REMEMBERED_SESSION_TTL_MS);
      expect(opts.maxAge).toBe(REMEMBERED_SESSION_TTL_MS);
      expect(opts.httpOnly).toBe(true);
      expect(opts.secure).toBe(true);
      expect(opts.sameSite).toBe("none");
    });

    it("sets the session cookie with the lifetime the session was created with", () => {
      process.env.NODE_ENV = "production";
      let capturedOpts: CookieOptions | undefined;
      const res = {
        cookie: (_name: string, _value: string, opts: CookieOptions) => {
          capturedOpts = opts;
        },
      } as unknown as Response;

      const created = createAdminSession("admin@bvps.edu", true)!;
      setSessionCookie(res, created.token, created.ttlMs);

      expect(capturedOpts).toBeDefined();
      expect(capturedOpts!.maxAge).toBe(REMEMBERED_SESSION_TTL_MS);
      expect(capturedOpts!.httpOnly).toBe(true);
      expect(capturedOpts!.secure).toBe(true);
      expect(capturedOpts!.sameSite).toBe("none");
    });
  });
});

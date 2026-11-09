import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  SESSION_COOKIE_NAME,
  createAdminSession,
  verifySessionToken,
  revokeSession,
  readSession,
} from "./session";
import type { Request } from "express";

describe("admin session", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-09T10:00:00Z"));
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
});

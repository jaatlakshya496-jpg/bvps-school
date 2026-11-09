import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { requireAdmin } from "./admin-auth";
import { createAdminSession } from "./session";
import type { Request, Response, NextFunction } from "express";

function makeReq(opts: { token?: string; csrf?: string; key?: string; method?: string }): Request {
  const headers: Record<string, string> = {};
  if (opts.key) headers["x-admin-key"] = opts.key;
  if (opts.csrf) headers["x-csrf-token"] = opts.csrf;
  return {
    method: opts.method ?? "GET",
    headers,
    cookies: opts.token ? { bvps_admin_session: opts.token } : {},
  } as unknown as Request;
}

function makeRes(): Response {
  const res = {
    statusCode: 200,
    status(code: number) { res.statusCode = code; return res; },
    json: () => res,
  } as unknown as Response;
  return res;
}

function run(req: Request, res: Response) {
  let nextCalled = false;
  let statusCode: number | undefined;
  const next: NextFunction = () => { nextCalled = true; };
  const wrapped = {
    status: (code: number) => { statusCode = code; return wrapped; },
    json: () => wrapped,
  } as unknown as Response;
  requireAdmin(req, wrapped, next);
  return { nextCalled, status: statusCode };
}

describe("requireAdmin", () => {
  const prevLegacy = process.env.ALLOW_LEGACY_ADMIN_KEY;

  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-session-secret";
    delete process.env.ALLOW_LEGACY_ADMIN_KEY;
  });

  afterEach(() => {
    if (prevLegacy === undefined) delete process.env.ALLOW_LEGACY_ADMIN_KEY;
    else process.env.ALLOW_LEGACY_ADMIN_KEY = prevLegacy;
  });

  it("rejects with 401 when no session exists and legacy key is disabled", () => {
    const res = makeRes();
    const out = run(makeReq({ method: "GET" }), res);
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(401);
  });

  it("allows an authenticated GET with a valid session", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    const out = run(makeReq({ token: created.token, method: "GET" }), makeRes());
    expect(out.nextCalled).toBe(true);
    expect(out.status).toBeUndefined();
  });

  it("allows an authenticated mutation when the CSRF token is valid", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    const out = run(makeReq({ token: created.token, csrf: created.session.csrf, method: "PUT" }), makeRes());
    expect(out.nextCalled).toBe(true);
  });

  it("rejects a mutation with an invalid CSRF token", () => {
    const created = createAdminSession("admin@bvps.edu")!;
    const out = run(makeReq({ token: created.token, csrf: "wrong-token", method: "PUT" }), makeRes());
    expect(out.nextCalled).toBe(false);
    expect(out.status).toBe(403);
  });

  it("accepts the legacy x-admin-key only when ALLOW_LEGACY_ADMIN_KEY is true", () => {
    process.env.ADMIN_SECRET = "legacy-secret";
    process.env.ALLOW_LEGACY_ADMIN_KEY = "true";
    const out = run(makeReq({ key: "legacy-secret", method: "GET" }), makeRes());
    expect(out.nextCalled).toBe(true);

    process.env.ALLOW_LEGACY_ADMIN_KEY = "false";
    const out2 = run(makeReq({ key: "legacy-secret", method: "GET" }), makeRes());
    expect(out2.nextCalled).toBe(false);
    expect(out2.status).toBe(401);
  });
});

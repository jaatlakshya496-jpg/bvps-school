import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRateLimiter, resetRateLimits } from "./rate-limit";
import type { Request, Response } from "express";

function makeReq(ip = "203.0.113.10"): Request {
  return {
    ip,
    socket: { remoteAddress: ip },
    headers: {},
    body: {},
  } as unknown as Request;
}

function makeRes(): Response & { headers: Record<string, string> } {
  const headers: Record<string, string> = {};
  const res = {
    statusCode: 200,
    headers,
    status(code: number) { res.statusCode = code; return res; },
    json: () => res,
    setHeader: (k: string, v: string) => { headers[k] = v; },
  };
  return res as unknown as Response & { headers: Record<string, string> };
}

describe("createRateLimiter", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.restoreAllMocks();
  });

  it("allows up to max requests and then rejects with 429 + Retry-After", () => {
    const limiter = createRateLimiter({ name: "test-bucket-a", windowMs: 60_000, max: 2 });

    const next1 = vi.fn();
    limiter(makeReq(), makeRes(), next1);
    expect(next1).toHaveBeenCalledTimes(1);

    const next2 = vi.fn();
    limiter(makeReq(), makeRes(), next2);
    expect(next2).toHaveBeenCalledTimes(1);

    const next3 = vi.fn();
    const res3 = makeRes();
    limiter(makeReq(), res3, next3);
    expect(next3).not.toHaveBeenCalled();
    expect(res3.statusCode).toBe(429);
    expect(res3.headers["Retry-After"]).toBeDefined();
  });

  it("resets the bucket after the window passes", () => {
    const limiter = createRateLimiter({ name: "test-bucket-b", windowMs: 60_000, max: 1 });

    const next1 = vi.fn();
    limiter(makeReq(), makeRes(), next1);
    expect(next1).toHaveBeenCalledTimes(1);

    const next2 = vi.fn();
    const res2 = makeRes();
    limiter(makeReq(), res2, next2);
    expect(next2).not.toHaveBeenCalled();
    expect(res2.statusCode).toBe(429);
    expect(res2.headers["Retry-After"]).toBeDefined();

    resetRateLimits();
    const next3 = vi.fn();
    const res3 = makeRes();
    limiter(makeReq(), res3, next3);
    expect(next3).toHaveBeenCalledTimes(1);
    expect(res3.statusCode).toBe(200);
  });
});

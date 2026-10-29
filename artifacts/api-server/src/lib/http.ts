import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger";

const isProd = process.env.NODE_ENV === "production";

/**
 * API security headers. Vercel frontend apne headers khud set karta hai; ye
 * sirf Render API responses ke liye hain (JSON/HTML error pages).
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

/** Admin responses ko browser/proxy cache mat karo. */
export function noStore(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  next();
}

/**
 * Public error messages me SQL/stack/DB internals kabhi na jaayein.
 * Detailed error sirf server log me jaata hai.
 */
export function publicError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!isProd) {
    if (err instanceof Error && err.message) return err.message;
  }
  return fallback;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const status =
    err && typeof err === "object" && "status" in err && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : err && typeof err === "object" && "type" in err && (err as { type?: string }).type === "entity.parse.failed"
        ? 400
        : 500;

  logger.error(
    {
      err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
      method: req.method,
      path: req.path,
    },
    "Unhandled API error",
  );

  if (res.headersSent) return;
  res.status(status).json({
    success: false,
    error:
      status === 400
        ? "Invalid JSON request body."
        : publicError(err, "Server error. Please try again later."),
  });
}

/** `/api/*` par JSON 404, HTML nahi. */
export function apiNotFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: "API endpoint not found" });
}

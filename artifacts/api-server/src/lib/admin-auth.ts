import type { NextFunction, Request, Response } from "express";
import { hasValidCsrf, readSession, timingSafeStringEqual } from "./session";

/**
 * Server-side admin authorization.
 *
 * Do supported modes:
 *  1. **Preferred:** HttpOnly session cookie (login/passcode se set hota hai)
 *     + `x-csrf-token` for state-changing methods.
 *  2. **Legacy:** `x-admin-key: <ADMIN_SECRET>` header. Ye sirf backward
 *     compatibility ke liye hai (purane scripts / emergency access). Frontend
 *     ab ise use nahi karta, isliye secret browser storage me nahi jaata.
 *
 * Har admin endpoint par ye middleware lagta hai — frontend checks par bharosa
 * nahi kiya jaata.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);

  if (session) {
    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase());
    if (isMutation && !hasValidCsrf(req, session)) {
      res.status(403).json({
        success: false,
        error: "Invalid or missing CSRF token. Please reload the admin portal.",
      });
      return;
    }
    next();
    return;
  }

  const rawKey = req.headers["x-admin-key"];
  const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    res.status(500).json({ success: false, error: "Admin not configured" });
    return;
  }

  if (typeof key === "string" && key.length > 0 && timingSafeStringEqual(key, secret)) {
    next();
    return;
  }

  res.status(401).json({ success: false, error: "Unauthorized. Please log in again." });
}

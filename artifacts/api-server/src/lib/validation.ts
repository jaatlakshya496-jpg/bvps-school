import type { Request } from "express";
import { z } from "zod";

/**
 * Common input validation. Har public form yahi primitives use karta hai taaki
 * limits frontend aur backend dono par consistent rahein.
 *
 * `submissionKey` idempotency ke liye hai: frontend ek UUID generate karta hai
 * aur retry/double-click par wahi key bhejta hai. DB me unique index hai,
 * isliye ek key se sirf ek row banti hai.
 */
export const nameField = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long");
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email is too long");
export const optionalEmailField = z
  .union([emailField, z.literal("")])
  .optional()
  .transform((value) => (value ? value : undefined));
export const phoneField = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine((value) => /^\+?[0-9]{10,15}$/.test(value), "Enter a valid phone number");
export const subjectField = z.string().trim().min(2, "Subject is too short").max(200, "Subject is too long");
export const messageField = z
  .string()
  .trim()
  .min(10, "Message must be at least 10 characters")
  .max(5000, "Message is too long (max 5000 characters)");
export const addressField = z
  .string()
  .trim()
  .min(5, "Address is too short")
  .max(500, "Address is too long");
export const submissionKeyField = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{8,80}$/, "Invalid submission key")
  .optional();
export const honeypotField = z
  .string()
  .max(0, "Invalid submission")
  .optional()
  .transform(() => undefined);

/** Browser `crypto.randomUUID()` ki tarah, par kisi bhi client ke liye optional. */
export function readSubmissionKey(req: Request, bodyKey?: string): string | undefined {
  if (bodyKey) return bodyKey;
  const header = req.headers["idempotency-key"];
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(trimmed) ? trimmed : undefined;
}

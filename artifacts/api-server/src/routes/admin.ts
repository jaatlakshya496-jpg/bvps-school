import { Router, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  contactSubmissionsTable,
  admissionEnquiriesTable,
  feedbackSubmissionsTable,
  principalMessagesTable,
} from "@workspace/db";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";
import { publicError } from "../lib/http";
import { loginEmailLimiter, loginIpLimiter, passcodeLimiter } from "../lib/rate-limit";
import {
  clearSessionCookie,
  createAdminSession,
  readSession,
  revokeSession,
  setSessionCookie,
  timingSafeStringEqual,
} from "../lib/session";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const credentialSchema = z.object({
  email: z.string().trim().max(254).optional(),
  password: z.string().max(200).optional(),
});

function adminConfigured(res: Response): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_SECRET) {
    res.status(500).json({
      success: false,
      error: "Admin not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SECRET on the server.",
    });
    return false;
  }
  return true;
}

function issueSession(res: Response, email: string) {
  const created = createAdminSession(email);
  if (!created) {
    res.status(500).json({ success: false, error: "Session could not be created. Check server configuration." });
    return false;
  }
  setSessionCookie(res, created.token);
  res.json({
    success: true,
    data: {
      email,
      csrfToken: created.session.csrf,
      expiresAt: new Date(created.session.exp).toISOString(),
    },
  });
  return true;
}

// Email + password login. Success par HttpOnly cookie set hoti hai; response
// me sirf email, CSRF token aur expiry jaati hai — ADMIN_SECRET kabhi nahi.
router.post("/login", loginIpLimiter, loginEmailLimiter, (req: Request, res: Response) => {
  if (!adminConfigured(res)) return;

  const parsed = credentialSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid email or password" });
    return;
  }

  const email = parsed.data.email ?? "";
  const password = parsed.data.password ?? "";
  const emailOk = email.trim().toLowerCase() === ADMIN_EMAIL!.toLowerCase();
  const passwordOk = timingSafeStringEqual(password, ADMIN_PASSWORD!);

  if (!emailOk || !passwordOk) {
    res.status(401).json({ success: false, error: "Invalid email or password" });
    return;
  }

  issueSession(res, ADMIN_EMAIL!);
});

// Fee editor ka passcode gate. Purana design ADMIN_SECRET ko localStorage me
// rakhta tha; ab passcode sirf ek baar verify hota hai aur cookie milti hai.
router.post("/session", passcodeLimiter, (req: Request, res: Response) => {
  if (!adminConfigured(res)) return;

  const secret = typeof req.body?.secret === "string" ? req.body.secret : "";
  if (!secret || secret.length > 200 || !timingSafeStringEqual(secret, ADMIN_SECRET!)) {
    res.status(401).json({ success: false, error: "Invalid passcode" });
    return;
  }

  issueSession(res, ADMIN_EMAIL!);
});

router.post("/logout", (req: Request, res: Response) => {
  revokeSession(readSession(req));
  clearSessionCookie(res);
  res.json({ success: true });
});

router.get("/status", requireAdmin, (_req: Request, res: Response) => {
  const session = readSession(_req);
  res.json({
    success: true,
    data: {
      email: session?.email ?? ADMIN_EMAIL ?? "admin",
      // Page reload ke baad frontend ko mutation requests ke liye CSRF token
      // chahiye. Ye token sirf authenticated response me jaata hai aur cookie
      // ke bina kaam nahi aata.
      csrfToken: session?.csrf ?? null,
      expiresAt: session ? new Date(session.exp).toISOString() : null,
      mode: session ? "cookie" : "legacy-key",
    },
  });
});

function pagination(req: Request): { limit: number; offset: number } {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  return { limit, offset };
}

router.get("/contact", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = pagination(req);
    const rows = await db
      .select()
      .from(contactSubmissionsTable)
      .orderBy(desc(contactSubmissionsTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Messages could not be loaded.") });
  }
});

router.get("/admissions", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = pagination(req);
    const rows = await db
      .select()
      .from(admissionEnquiriesTable)
      .orderBy(desc(admissionEnquiriesTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Admissions could not be loaded.") });
  }
});

router.get("/feedback", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = pagination(req);
    const rows = await db
      .select()
      .from(feedbackSubmissionsTable)
      .orderBy(desc(feedbackSubmissionsTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Feedback could not be loaded.") });
  }
});

router.get("/principal", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = pagination(req);
    const rows = await db
      .select()
      .from(principalMessagesTable)
      .orderBy(desc(principalMessagesTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Principal messages could not be loaded.") });
  }
});

// Submission delete (garbage/spam cleaning)
router.delete("/:kind/:id", requireAdmin, async (req: Request, res: Response) => {
  const kind = String(req.params.kind ?? "");
  const id = Number(req.params.id);
  if (!["contact", "admissions", "feedback", "principal"].includes(kind) || !Number.isInteger(id) || id <= 0) {
    res.status(400).json({ success: false, error: "Invalid request" });
    return;
  }
  try {
    if (kind === "contact") await db.delete(contactSubmissionsTable).where(eq(contactSubmissionsTable.id, id));
    else if (kind === "admissions") await db.delete(admissionEnquiriesTable).where(eq(admissionEnquiriesTable.id, id));
    else if (kind === "principal") await db.delete(principalMessagesTable).where(eq(principalMessagesTable.id, id));
    else await db.delete(feedbackSubmissionsTable).where(eq(feedbackSubmissionsTable.id, id));
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Delete failed. Please try again.") });
  }
});

export default router;

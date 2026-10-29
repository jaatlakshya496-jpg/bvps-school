import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { principalMessagesTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";
import { formLimiter } from "../lib/rate-limit";
import {
  honeypotField,
  messageField,
  nameField,
  optionalEmailField,
  phoneField,
  readSubmissionKey,
  subjectField,
  submissionKeyField,
} from "../lib/validation";

const router = Router();

const insertSchema = z.object({
  senderName: nameField,
  senderRole: z.string().trim().min(1).max(50).default("Parent"),
  phone: phoneField,
  email: optionalEmailField,
  category: z.string().trim().min(1).max(80).default("General Query"),
  subject: subjectField,
  message: messageField,
  submissionKey: submissionKeyField,
  website: honeypotField,
});

// "Write to Principal" form — message DB me save hota hai (admin portal) aur
// uske baad email/WhatsApp notification best-effort chalti hai.
router.post("/", formLimiter, async (req: Request, res: Response) => {
  let validated: z.infer<typeof insertSchema>;
  try {
    validated = insertSchema.parse(req.body ?? {});
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    res.status(400).json({ success: false, error: "Invalid submission" });
    return;
  }

  const submissionKey = readSubmissionKey(req, validated.submissionKey);
  const notification: Notification = {
    subject: `BVPS Principal Message: ${validated.subject}`,
    replyTo: validated.email,
    lines: [
      `From: ${validated.senderName} (${validated.senderRole})`,
      `Phone: ${validated.phone}`,
      validated.email ? `Email: ${validated.email}` : "",
      `Category: ${validated.category}`,
      "",
      validated.message,
    ].filter(Boolean),
  };
  const whatsappUrl = whatsAppClickLink(notification);

  let insertedId: number | null = null;
  let duplicate = false;
  try {
    const inserted = await db
      .insert(principalMessagesTable)
      .values({
        senderName: validated.senderName,
        senderRole: validated.senderRole,
        phone: validated.phone,
        email: validated.email ?? null,
        category: validated.category,
        subject: validated.subject,
        message: validated.message,
        submissionKey: submissionKey ?? null,
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: principalMessagesTable.submissionKey })
      .returning({ id: principalMessagesTable.id });

    insertedId = inserted[0]?.id ?? null;
    if (!insertedId && submissionKey) {
      const existing = await db
        .select({ id: principalMessagesTable.id })
        .from(principalMessagesTable)
        .where(eq(principalMessagesTable.submissionKey, submissionKey))
        .limit(1);
      insertedId = existing[0]?.id ?? null;
      duplicate = Boolean(insertedId);
    }
    if (!insertedId) throw new Error("Principal message insert returned no row");
  } catch (dbErr) {
    console.error("Principal message DB save error:", dbErr);
    res.status(503).json({
      success: false,
      savedToDb: false,
      error:
        "Your message could not be sent right now. Please try again, or call the school office at +91 98125 50200.",
      whatsappUrl,
    });
    return;
  }

  let emailSent = false;
  let whatsappSent = false;
  if (!duplicate) {
    try {
      const result = await notify(notification);
      emailSent = result.emailSent;
      whatsappSent = result.whatsappSent;
    } catch (err) {
      console.error("Principal notification error:", err);
    }
  }

  res.status(duplicate ? 200 : 201).json({
    success: true,
    message: duplicate ? "Message already received" : "Message sent to Principal",
    id: insertedId,
    duplicate,
    savedToDb: true,
    emailSent,
    whatsappSent,
    whatsappUrl,
  });
});

export default router;

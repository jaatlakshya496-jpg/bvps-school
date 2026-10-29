import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { feedbackSubmissionsTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";
import { formLimiter } from "../lib/rate-limit";
import {
  emailField,
  honeypotField,
  messageField,
  nameField,
  readSubmissionKey,
  submissionKeyField,
} from "../lib/validation";

const router = Router();

const insertSchema = z.object({
  name: nameField,
  email: emailField,
  role: z.enum(["parent", "student", "alumni", "visitor"]),
  category: z.enum(["academics", "facilities", "staff", "overall", "other"]),
  message: messageField,
  rating: z.number().int().min(1).max(5),
  submissionKey: submissionKeyField,
  website: honeypotField,
});

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
    subject: `BVPS Feedback (${validated.rating}/5) from ${validated.name}`,
    replyTo: validated.email,
    lines: [
      `Name: ${validated.name}`,
      `Email: ${validated.email}`,
      `Role: ${validated.role}`,
      `Category: ${validated.category}`,
      `Rating: ${validated.rating}/5`,
      "",
      validated.message,
    ],
  };
  const whatsappUrl = whatsAppClickLink(notification);

  let insertedId: number | null = null;
  let duplicate = false;
  try {
    const inserted = await db
      .insert(feedbackSubmissionsTable)
      .values({
        name: validated.name,
        email: validated.email,
        role: validated.role,
        category: validated.category,
        message: validated.message,
        rating: validated.rating,
        submissionKey: submissionKey ?? null,
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: feedbackSubmissionsTable.submissionKey })
      .returning({ id: feedbackSubmissionsTable.id });

    insertedId = inserted[0]?.id ?? null;
    if (!insertedId && submissionKey) {
      const existing = await db
        .select({ id: feedbackSubmissionsTable.id })
        .from(feedbackSubmissionsTable)
        .where(eq(feedbackSubmissionsTable.submissionKey, submissionKey))
        .limit(1);
      insertedId = existing[0]?.id ?? null;
      duplicate = Boolean(insertedId);
    }
    if (!insertedId) throw new Error("Feedback insert returned no row");
  } catch (dbErr) {
    console.error("Feedback DB save error:", dbErr);
    res.status(503).json({
      success: false,
      savedToDb: false,
      error:
        "Your feedback could not be saved right now. Please try again, or call the school office at +91 98125 50200.",
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
      console.error("Feedback notification error:", err);
    }
  }

  res.status(duplicate ? 200 : 201).json({
    success: true,
    message: duplicate ? "Feedback already received" : "Feedback saved",
    id: insertedId,
    duplicate,
    savedToDb: true,
    emailSent,
    whatsappSent,
    whatsappUrl,
  });
});

export default router;

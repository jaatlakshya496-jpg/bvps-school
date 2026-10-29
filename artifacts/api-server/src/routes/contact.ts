import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db";
import { z } from "zod";
import { formLimiter } from "../lib/rate-limit";
import {
  emailField,
  honeypotField,
  messageField,
  nameField,
  phoneField,
  readSubmissionKey,
  subjectField,
  submissionKeyField,
} from "../lib/validation";

const router = Router();

const insertSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  subject: subjectField,
  message: messageField,
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
  try {
    const inserted = await db
      .insert(contactSubmissionsTable)
      .values({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        subject: validated.subject,
        message: validated.message,
        submissionKey: submissionKey ?? null,
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: contactSubmissionsTable.submissionKey })
      .returning({ id: contactSubmissionsTable.id });

    let id = inserted[0]?.id ?? null;
    let duplicate = false;
    if (!id && submissionKey) {
      const existing = await db
        .select({ id: contactSubmissionsTable.id })
        .from(contactSubmissionsTable)
        .where(eq(contactSubmissionsTable.submissionKey, submissionKey))
        .limit(1);
      id = existing[0]?.id ?? null;
      duplicate = Boolean(id);
    }
    if (!id) throw new Error("Contact insert returned no row");

    res.status(duplicate ? 200 : 201).json({
      success: true,
      message: duplicate ? "Contact submission already saved" : "Contact submission saved",
      id,
      duplicate,
      savedToDb: true,
    });
  } catch (dbErr) {
    console.error("Contact DB save error:", dbErr);
    res.status(503).json({
      success: false,
      savedToDb: false,
      error: "Your message could not be saved right now. Please try again.",
    });
  }
});

export default router;

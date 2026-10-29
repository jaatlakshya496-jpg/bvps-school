import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";
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

const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  subject: subjectField,
  message: messageField,
  submissionKey: submissionKeyField,
  website: honeypotField,
});

router.post("/", formLimiter, async (req: Request, res: Response) => {
  let values: z.infer<typeof contactSchema>;
  try {
    values = contactSchema.parse(req.body ?? {});
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    res.status(400).json({ success: false, error: "Invalid submission" });
    return;
  }

  const submissionKey = readSubmissionKey(req, values.submissionKey);
  const notification: Notification = {
    subject: `BVPS Contact: ${values.subject}`,
    replyTo: values.email,
    lines: [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Subject: ${values.subject}`,
      "",
      values.message,
    ],
  };
  const whatsappUrl = whatsAppClickLink(notification);

  // Pehle DB me save — email/WhatsApp fail hone par bhi enquiry safe rahe.
  let insertedId: number | null = null;
  let duplicate = false;
  try {
    const inserted = await db
      .insert(contactSubmissionsTable)
      .values({
        name: values.name,
        email: values.email,
        phone: values.phone,
        subject: values.subject,
        message: values.message,
        submissionKey: submissionKey ?? null,
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: contactSubmissionsTable.submissionKey })
      .returning({ id: contactSubmissionsTable.id });

    insertedId = inserted[0]?.id ?? null;
    if (!insertedId && submissionKey) {
      const existing = await db
        .select({ id: contactSubmissionsTable.id })
        .from(contactSubmissionsTable)
        .where(eq(contactSubmissionsTable.submissionKey, submissionKey))
        .limit(1);
      insertedId = existing[0]?.id ?? null;
      duplicate = Boolean(insertedId);
    }
    if (!insertedId) throw new Error("Contact insert returned no row");
  } catch (dbErr) {
    console.error("Contact DB save error:", dbErr);
    res.status(503).json({
      success: false,
      savedToDb: false,
      error:
        "Your message could not be saved right now. Please try again, or call the school office at +91 98125 50200.",
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
      console.error("Contact notification error:", err);
    }
  }

  res.status(duplicate ? 200 : 201).json({
    success: true,
    message: duplicate ? "Enquiry already received" : "Enquiry saved",
    id: insertedId,
    duplicate,
    savedToDb: true,
    emailSent,
    whatsappSent,
    whatsappUrl,
  });
});

export default router;

import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { admissionEnquiriesTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";
import { formLimiter } from "../lib/rate-limit";
import { publicError } from "../lib/http";
import {
  addressField,
  honeypotField,
  messageField,
  nameField,
  optionalEmailField,
  phoneField,
  readSubmissionKey,
  submissionKeyField,
} from "../lib/validation";

const router = Router();

const dateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    return date <= now && date.getUTCFullYear() >= 1900;
  }, "Enter a valid date of birth");

const insertSchema = z.object({
  studentName: nameField,
  dob: dateField,
  gender: z.enum(["male", "female", "other"]),
  classApplying: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
  stream: z
    .union([z.enum(["non-medical", "medical", "commerce", "humanities"]), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  parentName: nameField,
  relation: z
    .union([z.enum(["father", "mother", "guardian"]), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  phone: phoneField,
  email: optionalEmailField,
  address: addressField,
  previousSchool: z.string().trim().max(200, "Previous school name is too long").optional(),
  message: z
    .union([messageField, z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  submissionKey: submissionKeyField,
  website: honeypotField,
});

router.post("/", formLimiter, async (req: Request, res: Response) => {
  let parsed: z.infer<typeof insertSchema>;
  try {
    parsed = insertSchema.parse(req.body ?? {});
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    res.status(400).json({ success: false, error: "Invalid submission" });
    return;
  }

  const submissionKey = readSubmissionKey(req, parsed.submissionKey);
  const notification: Notification = {
    subject: `BVPS Admission Application: ${parsed.studentName} (Class ${parsed.classApplying})`,
    replyTo: parsed.email,
    lines: [
      `Student: ${parsed.studentName}`,
      `Class applying: ${parsed.classApplying}`,
      parsed.stream ? `Stream: ${parsed.stream}` : "",
      `DOB: ${parsed.dob}`,
      `Gender: ${parsed.gender}`,
      `Parent: ${parsed.parentName}${parsed.relation ? ` (${parsed.relation})` : ""}`,
      `Phone: ${parsed.phone}`,
      parsed.email ? `Email: ${parsed.email}` : "",
      `Address: ${parsed.address}`,
      parsed.previousSchool ? `Previous school: ${parsed.previousSchool}` : "",
      parsed.message ? `Message: ${parsed.message}` : "",
    ].filter(Boolean),
  };
  const whatsappUrl = whatsAppClickLink(notification);

  // DB save pehle, aur success sirf tab jab row actually ban gayi ho.
  let insertedId: number | null = null;
  let duplicate = false;
  try {
    const inserted = await db
      .insert(admissionEnquiriesTable)
      .values({
        studentName: parsed.studentName,
        dob: parsed.dob,
        gender: parsed.gender,
        classApplying: parsed.classApplying,
        stream: parsed.stream ?? null,
        parentName: parsed.parentName,
        relation: parsed.relation ?? null,
        phone: parsed.phone,
        email: parsed.email ?? null,
        address: parsed.address,
        previousSchool: parsed.previousSchool || null,
        message: parsed.message || null,
        submissionKey: submissionKey ?? null,
        createdAt: new Date(),
      })
      // Same idempotency key dobara aaye toh duplicate row na bane.
      .onConflictDoNothing({ target: admissionEnquiriesTable.submissionKey })
      .returning({ id: admissionEnquiriesTable.id });

    insertedId = inserted[0]?.id ?? null;

    if (!insertedId && submissionKey) {
      const existing = await db
        .select({ id: admissionEnquiriesTable.id })
        .from(admissionEnquiriesTable)
        .where(eq(admissionEnquiriesTable.submissionKey, submissionKey))
        .limit(1);
      insertedId = existing[0]?.id ?? null;
      duplicate = Boolean(insertedId);
    }

    if (!insertedId) throw new Error("Admission insert returned no row");
  } catch (dbErr) {
    console.error("Admission DB save error:", dbErr);
    // DB fail hone par "success" kabhi nahi. PDF/WhatsApp manual fallback link
    // diya jaata hai taaki enquiry gum na ho.
    res.status(503).json({
      success: false,
      savedToDb: false,
      error:
        "Your application could not be saved right now. Please try again in a moment, or call the school office at +91 98125 50200.",
      whatsappUrl,
    });
    return;
  }

  // Retry/double-click par notification dobara na jaye.
  let emailSent = false;
  let whatsappSent = false;
  if (!duplicate) {
    try {
      const result = await notify(notification);
      emailSent = result.emailSent;
      whatsappSent = result.whatsappSent;
    } catch (err) {
      // Notification failure submission ko fail nahi karta — record DB me safe hai.
      console.error("Admission notification error:", err);
    }
  }

  res.status(duplicate ? 200 : 201).json({
    success: true,
    message: duplicate ? "Application already received" : "Application received",
    id: insertedId,
    duplicate,
    savedToDb: true,
    emailSent,
    whatsappSent,
    whatsappUrl,
  });
});

export default router;

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { admissionEnquiriesTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";

const router = Router();

const insertSchema = z.object({
	studentName: z.string().min(2),
	dob: z.string().min(1),
	gender: z.string().min(1),
	classApplying: z.string().min(1),
	stream: z.string().optional(),
	parentName: z.string().min(2),
	relation: z.string().optional(),
	phone: z.string().min(10),
	email: z.string().email().optional().or(z.literal("")),
	address: z.string().min(5),
	previousSchool: z.string().optional(),
	message: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const validated = insertSchema.parse(req.body);

		let savedToDb = false;
		try {
			await db.insert(admissionEnquiriesTable).values({
				studentName: validated.studentName,
				dob: validated.dob,
				gender: validated.gender,
				classApplying: validated.classApplying,
				stream: validated.stream || null,
				parentName: validated.parentName,
				relation: validated.relation || null,
				phone: validated.phone,
				email: validated.email || null,
				address: validated.address,
				previousSchool: validated.previousSchool || null,
				message: validated.message || null,
				createdAt: new Date(),
			});
			savedToDb = true;
		} catch (dbErr) {
			console.error("Admission DB save error:", dbErr);
		}

		const notification: Notification = {
			subject: `BVPS Admission Application: ${validated.studentName} (Class ${validated.classApplying})`,
			replyTo: validated.email || undefined,
			lines: [
				`Student: ${validated.studentName}`,
				`Class applying: ${validated.classApplying}`,
				validated.stream ? `Stream: ${validated.stream}` : "",
				`DOB: ${validated.dob}`,
				`Gender: ${validated.gender}`,
				`Parent: ${validated.parentName}${validated.relation ? ` (${validated.relation})` : ""}`,
				`Phone: ${validated.phone}`,
				validated.email ? `Email: ${validated.email}` : "",
				`Address: ${validated.address}`,
				validated.previousSchool ? `Previous school: ${validated.previousSchool}` : "",
				validated.message ? `Message: ${validated.message}` : "",
			].filter(Boolean),
		};

		const { emailSent, whatsappSent } = await notify(notification);
		const whatsappUrl = whatsAppClickLink(notification);

		if (!savedToDb && !emailSent && !whatsappSent) {
			res.status(500).json({ success: false, error: "Failed to save application", whatsappUrl });
			return;
		}

		res.status(201).json({ success: true, message: "Application received", savedToDb, emailSent, whatsappSent, whatsappUrl });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

export default router;

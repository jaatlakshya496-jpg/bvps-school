import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";

const router = Router();

const contactSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().min(10),
	subject: z.string().min(2),
	message: z.string().min(10),
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const values = contactSchema.parse(req.body);

		// Pehle DB me save karo - taaki email/WhatsApp fail hone par bhi enquiry safe rahe
		// (admin portal ke Messages section me dikhegi).
		let savedToDb = false;
		try {
			await db.insert(contactSubmissionsTable).values({
				name: values.name,
				email: values.email,
				phone: values.phone,
				subject: values.subject,
				message: values.message,
				createdAt: new Date(),
			});
			savedToDb = true;
		} catch (dbErr) {
			console.error("Contact DB save error:", dbErr);
		}

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

		const { emailSent, whatsappSent } = await notify(notification);
		const whatsappUrl = whatsAppClickLink(notification);

		if (!savedToDb && !emailSent && !whatsappSent) {
			res.status(500).json({ success: false, error: "Failed to save enquiry", whatsappUrl });
			return;
		}

		res.status(200).json({
			success: true,
			message: "Enquiry received",
			savedToDb,
			emailSent,
			whatsappSent,
			whatsappUrl,
		});
	} catch (err: any) {
		console.error("Contact email error:", err);
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message || "Failed to send message" });
		}
	}
});

export default router;

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { principalMessagesTable } from "@workspace/db";
import { z } from "zod";
import { notify, whatsAppClickLink, type Notification } from "../lib/notify";

const router = Router();

const insertSchema = z.object({
	senderName: z.string().min(2),
	senderRole: z.string().min(1).default("Parent"),
	phone: z.string().min(10),
	email: z.string().email().optional().or(z.literal("")),
	category: z.string().min(1).default("General Query"),
	subject: z.string().min(2),
	message: z.string().min(10),
});

// "Write to Principal" form — pehle sirf visitor ke browser localStorage me
// save hota tha (admin tak message pahunchta hi nahi tha). Ab DB + email dono.
router.post("/", async (req: Request, res: Response) => {
	try {
		const validated = insertSchema.parse(req.body);

		let savedToDb = false;
		let savedId: number | null = null;
		try {
			const inserted = await db
				.insert(principalMessagesTable)
				.values({
					senderName: validated.senderName,
					senderRole: validated.senderRole,
					phone: validated.phone,
					email: validated.email || null,
					category: validated.category,
					subject: validated.subject,
					message: validated.message,
					createdAt: new Date(),
				})
				.returning({ id: principalMessagesTable.id });
			savedToDb = true;
			savedId = inserted?.[0]?.id ?? null;
		} catch (dbErr) {
			console.error("Principal message DB save error:", dbErr);
		}

		const notification: Notification = {
			subject: `BVPS Principal Message: ${validated.subject}`,
			replyTo: validated.email || undefined,
			lines: [
				`From: ${validated.senderName} (${validated.senderRole})`,
				`Phone: ${validated.phone}`,
				validated.email ? `Email: ${validated.email}` : "",
				`Category: ${validated.category}`,
				"",
				validated.message,
			].filter(Boolean),
		};

		const { emailSent, whatsappSent } = await notify(notification);
		const whatsappUrl = whatsAppClickLink(notification);

		if (!savedToDb && !emailSent && !whatsappSent) {
			res.status(500).json({ success: false, error: "Failed to send message", whatsappUrl });
			return;
		}

		res.status(201).json({ success: true, message: "Message sent to Principal", id: savedId, savedToDb, emailSent, whatsappSent, whatsappUrl });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

export default router;

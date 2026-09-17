import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { feedbackSubmissionsTable } from "@workspace/db";
import { z } from "zod";
import { notify, type Notification } from "../lib/notify";

const router = Router();

const insertSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	role: z.enum(["parent", "student", "alumni", "visitor"]),
	category: z.enum(["academics", "facilities", "staff", "overall", "other"]),
	message: z.string().min(10),
	rating: z.number().int().min(1).max(5),
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const validated = insertSchema.parse(req.body);
		await db.insert(feedbackSubmissionsTable).values({
			name: validated.name,
			email: validated.email,
			role: validated.role,
			category: validated.category,
			message: validated.message,
			rating: validated.rating,
			createdAt: new Date(),
		});
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

		const { emailSent, whatsappSent } = await notify(notification);
		res.status(201).json({ success: true, message: "Feedback saved", emailSent, whatsappSent });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

export default router;
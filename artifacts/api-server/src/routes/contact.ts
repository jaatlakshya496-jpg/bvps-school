import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db";
import { z } from "zod";

const router = Router();

const insertSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().min(10),
	subject: z.string().min(2),
	message: z.string().min(10),
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const validated = insertSchema.parse(req.body);
		await db.insert(contactSubmissionsTable).values({
			name: validated.name,
			email: validated.email,
			phone: validated.phone,
			subject: validated.subject,
			message: validated.message,
			createdAt: new Date(),
		});
		res.status(201).json({ success: true, message: "Contact submission saved" });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

export default router;
import { Router, type Request, type Response } from "express";
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

		res.status(200).json({
			success: true,
			message: "Enquiry received",
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

import { Router, type Request, type Response } from "express";
import { z } from "zod";

const router = Router();

const ADMIN_EMAIL = "jaatlakshya496@gmail.com";
const ADMIN_WHATSAPP = "919671772205";
const SITE_ORIGIN = "https://bvps-school.vercel.app";
const NTFY_TOPIC = process.env.NTFY_TOPIC || "bvps-contact-9671772205-a7f3k9x2q";

const contactSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().min(10),
	subject: z.string().min(2),
	message: z.string().min(10),
});

type ContactValues = z.infer<typeof contactSchema>;

async function sendEmail(values: ContactValues) {
	const res = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Origin: SITE_ORIGIN,
			Referer: `${SITE_ORIGIN}/contact`,
			"User-Agent": "Mozilla/5.0",
		},
		body: JSON.stringify({
			name: values.name,
			email: values.email,
			phone: values.phone,
			_subject: `BVPS Contact: ${values.subject}`,
			_template: "table",
			_replyto: values.email,
			message: values.message,
		}),
	});

	const data: any = await res.json().catch(() => ({}));
	if (!res.ok || String(data.success) !== "true") {
		throw new Error(data.message || "Email delivery failed");
	}
}

async function sendPhonePush(values: ContactValues) {
	const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
		method: "POST",
		headers: {
			Title: `BVPS enquiry: ${values.subject}`,
			Priority: "high",
			Tags: "school",
			Click: SITE_ORIGIN,
		},
		body: `Name: ${values.name}\nPhone: ${values.phone}\nEmail: ${values.email}\n\n${values.message}`,
	});
	if (!res.ok) {
		throw new Error("Phone notification failed");
	}
}

router.post("/", async (req: Request, res: Response) => {
	try {
		const values = contactSchema.parse(req.body);

		const results = await Promise.allSettled([sendEmail(values), sendPhonePush(values)]);
		const emailOk = results[0].status === "fulfilled";
		const pushOk = results[1].status === "fulfilled";

		if (!emailOk) {
			console.error("Contact email error:", (results[0] as PromiseRejectedResult).reason);
		}
		if (!pushOk) {
			console.error("Contact push error:", (results[1] as PromiseRejectedResult).reason);
		}

		const whatsappText = `New BVPS Contact Enquiry\n\nName: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\nSubject: ${values.subject}\n\nMessage:\n${values.message}`;
		const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(whatsappText)}`;

		if (!emailOk && !pushOk) {
			res.status(500).json({ success: false, error: "Failed to deliver notification", whatsappUrl });
			return;
		}

		res.status(200).json({
			success: true,
			message: "Enquiry received",
			emailSent: emailOk,
			pushSent: pushOk,
			whatsappUrl,
		});
	} catch (err: any) {
		console.error("Contact email error:", err);
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message || "Failed to send email" });
		}
	}
});

export default router;

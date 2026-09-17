import { Router, type Request, type Response } from "express";
import { z } from "zod";

const router = Router();

const ADMIN_EMAIL = "jaatlakshya496@gmail.com";
const ADMIN_WHATSAPP = "+919671772205";
const SITE_ORIGIN = "https://bvps-school.vercel.app";

const contactSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().min(10),
	subject: z.string().min(2),
	message: z.string().min(10),
});

type ContactValues = z.infer<typeof contactSchema>;

function formatText(values: ContactValues) {
	return `New BVPS Contact Enquiry\n\nName: ${values.name}\nPhone: ${values.phone}\nEmail: ${values.email}\nSubject: ${values.subject}\n\n${values.message}`;
}

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

async function sendWhatsApp(values: ContactValues) {
	const apikey = process.env.CALLMEBOT_APIKEY;
	if (!apikey) {
		throw new Error("CALLMEBOT_APIKEY not set");
	}

	const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(ADMIN_WHATSAPP)}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(formatText(values))}`;
	const res = await fetch(url);
	const text = await res.text();
	if (!res.ok || /error|not allowed|invalid/i.test(text)) {
		throw new Error(`WhatsApp delivery failed: ${text.slice(0, 120)}`);
	}
}

router.post("/", async (req: Request, res: Response) => {
	try {
		const values = contactSchema.parse(req.body);

		const results = await Promise.allSettled([sendEmail(values), sendWhatsApp(values)]);
		const emailOk = results[0].status === "fulfilled";
		const whatsappOk = results[1].status === "fulfilled";

		if (!emailOk) {
			console.error("Contact email error:", (results[0] as PromiseRejectedResult).reason);
		}
		if (!whatsappOk) {
			console.error("Contact whatsapp error:", (results[1] as PromiseRejectedResult).reason);
		}

		const whatsappUrl = `https://wa.me/919671772205?text=${encodeURIComponent(formatText(values))}`;

		if (!emailOk && !whatsappOk) {
			res.status(500).json({ success: false, error: "Failed to deliver notification", whatsappUrl });
			return;
		}

		res.status(200).json({
			success: true,
			message: "Enquiry received",
			emailSent: emailOk,
			whatsappSent: whatsappOk,
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

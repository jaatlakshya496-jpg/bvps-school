import { Router, type Request, type Response } from "express";
// @ts-ignore
import nodemailer from "nodemailer";
import { z } from "zod";

let transporter: nodemailer.Transporter | null = null;

const router = Router();

const contactSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().min(10),
	subject: z.string().min(2),
	message: z.string().min(10),
});

type ContactValues = z.infer<typeof contactSchema>;

async function ensureTransporter() {
	if (!transporter) {
		const user = process.env.GMAIL_USER;
		const pass = process.env.GMAIL_APP_PASSWORD;

		if (!user || !pass) {
			throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment");
		}

		transporter = nodemailer.createTransport({
		 host: "smtp.gmail.com",
		 port: 465,
		 secure: true, // SSL
		 auth: {
		  user,
		  pass,
		 },
		});

		await transporter.verify();
	}
	return transporter;
}

router.post("/", async (req: Request, res: Response) => {
	try {
		const validated = contactSchema.parse(req.body);

		await ensureTransporter();

		const mailOptions = {
		 from: `"BVPS Contact Form" <${process.env.GMAIL_USER}>`,
		 to: "jaatlakshya496@gmail.com",
		 replyTo: validated.email,
		 subject: `BVPS Contact: ${validated.subject}`,
		 text: `
From: ${validated.name} <${validated.email}>
Phone: ${validated.phone}

Message:
${validated.message}
`,
		 html: `
<h3>BVPS Contact Form Submission</h3>
<p><strong>Name:</strong> ${validated.name}</p>
<p><strong>Email:</strong> <a href="mailto:${validated.email}">${validated.email}</a></p>
<p><strong>Phone:</strong> ${validated.phone}</p>
<p><strong>Subject:</strong> ${validated.subject}</p>
<p><strong>Message:</strong> ${validated.message.replace(/\n/g, "<br>")}</p>
`,
		};

		const tr = await ensureTransporter();
		await tr.sendMail(mailOptions);

		res.status(200).json({ success: true, message: "Email sent successfully" });
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
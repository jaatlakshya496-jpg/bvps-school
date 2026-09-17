const ADMIN_EMAIL = "jaatlakshya496@gmail.com";
const ADMIN_WHATSAPP = "+919671772205";
const SITE_ORIGIN = "https://bvps-school.vercel.app";

export interface Notification {
	subject: string;
	lines: string[];
	replyTo?: string;
}

function formatBody(n: Notification) {
	return `${n.subject}\n\n${n.lines.join("\n")}`;
}

export async function sendEmail(n: Notification): Promise<boolean> {
	try {
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
				_subject: n.subject,
				_template: "table",
				_replyto: n.replyTo || ADMIN_EMAIL,
				message: n.lines.join("\n"),
			}),
		});

		const data: any = await res.json().catch(() => ({}));
		if (!res.ok || String(data.success) !== "true") {
			throw new Error(data.message || "Email delivery failed");
		}
		return true;
	} catch (err) {
		console.error("notify: email failed", err);
		return false;
	}
}

export async function sendWhatsApp(n: Notification): Promise<boolean> {
	const apikey = process.env.CALLMEBOT_APIKEY;
	if (!apikey) {
		console.error("notify: CALLMEBOT_APIKEY not set");
		return false;
	}

	try {
		const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(ADMIN_WHATSAPP)}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(formatBody(n))}`;
		const res = await fetch(url);
		const text = await res.text();
		if (!res.ok || /error|not allowed|invalid|not activated/i.test(text)) {
			throw new Error(`WhatsApp delivery failed: ${text.slice(0, 120)}`);
		}
		return true;
	} catch (err) {
		console.error("notify: whatsapp failed", err);
		return false;
	}
}

export async function notify(n: Notification) {
	const [emailSent, whatsappSent] = await Promise.all([sendEmail(n), sendWhatsApp(n)]);
	return { emailSent, whatsappSent };
}

export function whatsAppClickLink(n: Notification) {
	return `https://wa.me/919671772205?text=${encodeURIComponent(formatBody(n))}`;
}

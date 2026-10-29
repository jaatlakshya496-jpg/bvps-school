const ADMIN_EMAIL = process.env.NOTIFY_EMAIL || "jaatlakshya496@gmail.com";
const ADMIN_WHATSAPP = process.env.NOTIFY_WHATSAPP || "+919671772205";
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://bvps-school.vercel.app").replace(/\/+$/, "");
const NOTIFY_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, init: RequestInit = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(NOTIFY_TIMEOUT_MS) });
}

export interface Notification {
	subject: string;
	lines: string[];
	replyTo?: string;
}

function formatBody(n: Notification) {
	return `${n.subject}\n\n${n.lines.join("\n")}`;
}

function emailHtml(n: Notification) {
	const rows = n.lines
		.map((l) =>
			l === ""
				? `<tr><td style="height:8px"></td></tr>`
				: `<tr><td style="padding:3px 0;color:#0f172a;white-space:pre-wrap">${escapeHtml(l)}</td></tr>`,
		)
		.join("");
	return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0f172a;max-width:640px"><h2 style="margin:0 0 12px;color:#b45309">${escapeHtml(n.subject)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table><p style="margin-top:16px;color:#64748b;font-size:12px">BVPS School website form submission</p></div>`;
}

function escapeHtml(s: string) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function sendViaResend(n: Notification): Promise<boolean> {
	const apikey = process.env.RESEND_API_KEY;
	if (!apikey) return false;

	const res = await fetchWithTimeout("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apikey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: "BVPS Website <onboarding@resend.dev>",
			to: [ADMIN_EMAIL],
			reply_to: n.replyTo || ADMIN_EMAIL,
			subject: n.subject,
			text: formatBody(n),
			html: emailHtml(n),
		}),
	});

	const data: any = await res.json().catch(() => ({}));
	if (!res.ok || !data.id) {
		throw new Error(data.message || `Resend failed (${res.status})`);
	}
	return true;
}

async function sendViaFormSubmit(n: Notification): Promise<boolean> {
	const res = await fetchWithTimeout(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
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
}

export async function sendEmail(n: Notification): Promise<boolean> {
	// FormSubmit primary — user ne activation kar li hai, aur ye seedha admin ke
	// Gmail par relay karta hai (koi API key/domain nahi chahiye, spam risk kam).
	let formSubmitErr: unknown = null;
	try {
		return await sendViaFormSubmit(n);
	} catch (err) {
		formSubmitErr = err;
		console.error("notify: FormSubmit email failed, Resend fallback try ho raha hai", err);
	}

	// Fallback: Resend (agar RESEND_API_KEY set hai).
	if (process.env.RESEND_API_KEY) {
		try {
			return await sendViaResend(n);
		} catch (err) {
			console.error("notify: Resend fallback bhi fail ho gaya", err);
		}
	} else if (formSubmitErr) {
		console.error("notify: RESEND_API_KEY set nahi hai - koi email channel available nahi");
	}

	return false;
}

let warnedMissingKey = false;

export async function sendWhatsApp(n: Notification): Promise<boolean> {
	const apikey = process.env.CALLMEBOT_APIKEY;
	if (!apikey) {
		if (!warnedMissingKey) {
			warnedMissingKey = true;
			// Render logs me ek baar dikh jayega - warna pata hi nahi chalega ki
			// WhatsApp alerts band hain.
			console.warn(
				"notify: CALLMEBOT_APIKEY set nahi hai - WhatsApp alerts disabled (message sirf DB/email tak jayega)",
			);
		}
		return false;
	}

	try {
		// CallMeBot URL bahut lambi na ho — message ko reasonable length tak trim.
		const text = formatBody(n).slice(0, 1200);
		const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(ADMIN_WHATSAPP)}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(text)}`;
		const res = await fetchWithTimeout(url);
		const textBody = await res.text();
		if (!res.ok || /error|not allowed|invalid|not activated/i.test(textBody)) {
			throw new Error(`WhatsApp delivery failed: ${textBody.slice(0, 120)}`);
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
	const text = formatBody(n).slice(0, 1800);
	return `https://wa.me/${ADMIN_WHATSAPP.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}

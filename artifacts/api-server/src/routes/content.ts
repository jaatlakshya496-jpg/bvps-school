import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { siteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";

/**
 * Website content editor ka backend.
 *
 * `site_content` ek simple key/value table hai jahan se admin portal saari
 * website text edit kar sakta hai (hero headings, contact details, SEO title
 * waghera). Value hamesha JSON string me hoti hai, isliye string/number/array
 * sab store ho sakte hain.
 *
 * Public endpoint kabhi fail nahi karta — DB down ho toh empty map return hota
 * hai aur frontend apne built-in defaults use karta hai (site kabhi na toote).
 */

const KEY_RE = /^[a-zA-Z0-9_.\-/]{1,120}$/;
const MAX_VALUE_CHARS = 20000;

/** DB row -> JS value (JSON parse; galat data par raw string wapas). */
function decode(raw: string): unknown {
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
	}
}

export async function getContentMap(): Promise<Record<string, unknown>> {
	try {
		const rows = await db.select().from(siteContentTable);
		const out: Record<string, unknown> = {};
		for (const row of rows) out[row.key] = decode(row.value);
		return out;
	} catch (err) {
		console.error("site_content read error (using defaults):", err);
		return {};
	}
}

const putSchema = z.object({
	items: z.record(
		z.string().regex(KEY_RE, "Invalid content key"),
		z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any()), z.object({}).passthrough()]),
	),
});

const router = Router();

/** Public — frontend isse content overrides ke liye call karta hai. */
router.get("/", async (_req: Request, res: Response) => {
	const data = await getContentMap();
	res.json({ success: true, data });
});

/** Admin — keys ke saath updatedAt bhi (UI "last edited" dikhata hai). */
router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
	try {
		const rows = await db.select().from(siteContentTable);
		const data: Record<string, unknown> = {};
		const meta: Record<string, string> = {};
		for (const row of rows) {
			data[row.key] = decode(row.value);
			meta[row.key] = new Date(row.updatedAt).toISOString();
		}
		res.json({ success: true, data, meta });
	} catch (err: any) {
		console.error("site_content admin read error:", err);
		res.status(500).json({ success: false, error: err.message });
	}
});

/** Admin — ek saath bahut saare keys upsert karo. */
router.put("/", requireAdmin, async (req: Request, res: Response) => {
	try {
		const { items } = putSchema.parse(req.body);
		const entries = Object.entries(items);
		if (!entries.length) {
			res.json({ success: true, data: await getContentMap(), message: "Kuch nahi badla." });
			return;
		}
		for (const [key, value] of entries) {
			const encoded = JSON.stringify(value ?? null);
			if (encoded.length > MAX_VALUE_CHARS) {
				res.status(400).json({
					success: false,
					error: `"${key}" ki value bahut badi hai (max ${MAX_VALUE_CHARS} characters).`,
				});
				return;
			}
		}
		await db.transaction(async (tx: any) => {
			for (const [key, value] of entries) {
				await tx
					.insert(siteContentTable)
					.values({ key, value: JSON.stringify(value ?? null), updatedAt: new Date() })
					.onConflictDoUpdate({ target: siteContentTable.key, set: { value: JSON.stringify(value ?? null), updatedAt: new Date() } });
			}
		});
		res.json({ success: true, data: await getContentMap(), message: "Website content updated." });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			console.error("site_content save error:", err);
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

/** Admin — ek key hatao (default value wapas aa jaati hai). */
router.delete("/:key", requireAdmin, async (req: Request, res: Response) => {
	try {
		const key = String(req.params.key ?? "");
		if (!KEY_RE.test(key)) {
			res.status(400).json({ success: false, error: "Invalid content key" });
			return;
		}
		await db.delete(siteContentTable).where(eq(siteContentTable.key, key));
		res.json({ success: true, data: await getContentMap(), message: `"${key}" reset ho gaya.` });
	} catch (err: any) {
		console.error("site_content delete error:", err);
		res.status(500).json({ success: false, error: err.message });
	}
});

export default router;

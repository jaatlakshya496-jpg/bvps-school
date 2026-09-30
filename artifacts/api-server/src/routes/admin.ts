import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { contactSubmissionsTable, admissionEnquiriesTable, feedbackSubmissionsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Email + password se login — success par wahi token wapas milta hai jo
// baaki admin endpoints ke liye "x-admin-key" header mein use hota hai.
router.post("/login", (req: Request, res: Response) => {
	const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

	if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_SECRET) {
		res.status(500).json({ success: false, error: "Admin not configured (ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_SECRET set karo)" });
		return;
	}

	if (typeof email !== "string" || typeof password !== "string" || email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
		res.status(401).json({ success: false, error: "Invalid email or password" });
		return;
	}

	res.json({ success: true, data: { token: ADMIN_SECRET, email: ADMIN_EMAIL } });
});

router.get("/status", requireAdmin, (_req: Request, res: Response) => {
	res.json({ success: true, data: { email: ADMIN_EMAIL ?? "admin", token: ADMIN_SECRET } });
});

router.get("/contact", requireAdmin, async (req: Request, res: Response) => {
	const rows = await db.select().from(contactSubmissionsTable).orderBy(contactSubmissionsTable.createdAt);
	res.json({ success: true, data: rows });
});

router.get("/admissions", requireAdmin, async (req: Request, res: Response) => {
	const rows = await db.select().from(admissionEnquiriesTable).orderBy(admissionEnquiriesTable.createdAt);
	res.json({ success: true, data: rows });
});

router.get("/feedback", requireAdmin, async (req: Request, res: Response) => {
	const rows = await db.select().from(feedbackSubmissionsTable).orderBy(feedbackSubmissionsTable.createdAt);
	res.json({ success: true, data: rows });
});

// Submission delete (garbage/spam cleaning)
router.delete("/:kind/:id", requireAdmin, async (req: Request, res: Response) => {
	const kind = String(req.params.kind ?? "");
	const id = Number(req.params.id);
	if (!["contact", "admissions", "feedback"].includes(kind) || !Number.isInteger(id) || id <= 0) {
		res.status(400).json({ success: false, error: "Invalid request" });
		return;
	}
	try {
		if (kind === "contact") await db.delete(contactSubmissionsTable).where(eq(contactSubmissionsTable.id, id));
		else if (kind === "admissions") await db.delete(admissionEnquiriesTable).where(eq(admissionEnquiriesTable.id, id));
		else await db.delete(feedbackSubmissionsTable).where(eq(feedbackSubmissionsTable.id, id));
		res.json({ success: true, message: "Deleted" });
	} catch (err: any) {
		res.status(500).json({ success: false, error: err?.message ?? "Delete failed" });
	}
});

export default router;
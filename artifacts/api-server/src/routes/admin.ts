import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable, admissionEnquiriesTable, feedbackSubmissionsTable } from "@workspace/db";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function requireAdmin(req: Request, res: Response, next: (err?: any) => void) {
	const key = req.headers["x-admin-key"];
	if (!ADMIN_SECRET) {
		res.status(500).json({ success: false, error: "Admin not configured" });
		return;
	}
	if (key !== ADMIN_SECRET) {
		res.status(403).json({ success: false, error: "Forbidden: invalid admin key" });
		return;
	}
	next();
}

router.get("/contact", requireAdmin, async (req: Request, res: Response) => {
	const rows = await db.select().from(contactSubmissionsTable);
	res.json({ success: true, data: rows });
});

router.get("/admissions", requireAdmin, async (req: Request, res: Response) => {
	const rows = await db.select().from(admissionEnquiriesTable);
	res.json({ success: true, data: rows });
});

router.get("/feedback", requireAdmin, async (req: Request, res: Response) => {
	const rows = await db.select().from(feedbackSubmissionsTable);
	res.json({ success: true, data: rows });
});

export default router;
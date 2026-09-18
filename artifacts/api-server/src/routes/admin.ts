import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable, admissionEnquiriesTable, feedbackSubmissionsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();

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
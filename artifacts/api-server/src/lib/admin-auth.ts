import type { Request, Response } from "express";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function requireAdmin(req: Request, res: Response, next: (err?: any) => void) {
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

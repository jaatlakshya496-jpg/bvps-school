import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { feeStructureTable } from "@workspace/db";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";

export interface FeeClass {
	name: string;
	group: string;
	admission: number;
	monthly: number;
	annualFund: number;
}

export interface FeeStream {
	name: string;
	hindiName: string;
	admission: number;
	monthly: number;
	annualFund: number;
}

export interface FeeConfig {
	classes: FeeClass[];
	streams: FeeStream[];
}

export const defaultFeeConfig: FeeConfig = {
	classes: [
		{ name: "Class 1", group: "Primary", admission: 3000, monthly: 900, annualFund: 1500 },
		{ name: "Class 2", group: "Primary", admission: 3000, monthly: 950, annualFund: 1500 },
		{ name: "Class 3", group: "Primary", admission: 3500, monthly: 1000, annualFund: 1800 },
		{ name: "Class 4", group: "Primary", admission: 3500, monthly: 1050, annualFund: 1800 },
		{ name: "Class 5", group: "Primary", admission: 3500, monthly: 1100, annualFund: 2000 },
		{ name: "Class 6", group: "Middle", admission: 4500, monthly: 1300, annualFund: 2000 },
		{ name: "Class 7", group: "Middle", admission: 4500, monthly: 1400, annualFund: 2000 },
		{ name: "Class 8", group: "Middle", admission: 4500, monthly: 1500, annualFund: 2500 },
		{ name: "Class 9", group: "Secondary", admission: 5500, monthly: 2500, annualFund: 5000 },
		{ name: "Class 10", group: "Secondary", admission: 5500, monthly: 2500, annualFund: 5000 },
	],
	streams: [
		{ name: "Arts", hindiName: "कला", admission: 7000, monthly: 2800, annualFund: 6400 },
		{ name: "Commerce", hindiName: "वाणिज्य", admission: 7000, monthly: 3200, annualFund: 6600 },
		{ name: "Non-Medical", hindiName: "विज्ञान", admission: 7000, monthly: 3700, annualFund: 5600 },
	],
};

const feeConfigSchema = z.object({
	classes: z
		.array(
			z.object({
				name: z.string().min(1),
				group: z.string().default(""),
				admission: z.number().int().min(0),
				monthly: z.number().int().min(0),
				annualFund: z.number().int().min(0),
			}),
		)
		.min(1),
	streams: z
		.array(
			z.object({
				name: z.string().min(1),
				hindiName: z.string().default(""),
				admission: z.number().int().min(0),
				monthly: z.number().int().min(0),
				annualFund: z.number().int().min(0),
			}),
		)
		.min(1),
});

export async function getFeeConfig(): Promise<FeeConfig> {
	try {
		const rows = await db.select().from(feeStructureTable).orderBy(feeStructureTable.sortOrder);
		if (!rows.length) return defaultFeeConfig;
		const classes = rows
			.filter((r: any) => r.kind === "class")
			.map((r: any) => ({
				name: r.name,
				group: r.subtitle ?? "",
				admission: r.admission,
				monthly: r.monthly,
				annualFund: r.annualFund,
			}));
		const streams = rows
			.filter((r: any) => r.kind === "stream")
			.map((r: any) => ({
				name: r.name,
				hindiName: r.subtitle ?? "",
				admission: r.admission,
				monthly: r.monthly,
				annualFund: r.annualFund,
			}));
		if (!classes.length || !streams.length) return defaultFeeConfig;
		return { classes, streams };
	} catch (err) {
		console.error("Fee config read error (falling back to defaults):", err);
		return defaultFeeConfig;
	}
}

export async function saveFeeConfig(config: FeeConfig): Promise<void> {
	await db.transaction(async (tx: any) => {
		await tx.delete(feeStructureTable);
		const rows = [
			...config.classes.map((c, i) => ({
				kind: "class",
				name: c.name,
				subtitle: c.group,
				admission: c.admission,
				monthly: c.monthly,
				annualFund: c.annualFund,
				sortOrder: i,
				updatedAt: new Date(),
			})),
			...config.streams.map((s, i) => ({
				kind: "stream",
				name: s.name,
				subtitle: s.hindiName,
				admission: s.admission,
				monthly: s.monthly,
				annualFund: s.annualFund,
				sortOrder: i,
				updatedAt: new Date(),
			})),
		];
		if (rows.length) await tx.insert(feeStructureTable).values(rows);
	});
}

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
	const data = await getFeeConfig();
	res.json({ success: true, data });
});

router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
	const data = await getFeeConfig();
	res.json({ success: true, data });
});

router.put("/admin", requireAdmin, async (req: Request, res: Response) => {
	try {
		const validated = feeConfigSchema.parse(req.body) as FeeConfig;
		await saveFeeConfig(validated);
		const data = await getFeeConfig();
		res.json({ success: true, data, message: "Fees updated successfully" });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			console.error("Fee config save error:", err);
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

export default router;

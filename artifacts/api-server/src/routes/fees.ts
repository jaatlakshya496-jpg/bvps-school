import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { feeStructureTable } from "@workspace/db";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";
import { publicError } from "../lib/http";

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
    { name: "Non-Medical", hindiName: "नॉन-मेडिकल", admission: 7000, monthly: 3700, annualFund: 5600 },
  ],
};

const amount = z.number().int().min(0).max(10_000_000);
const name = z.string().trim().min(1).max(50);

const feeConfigSchema = z
  .object({
    classes: z
      .array(
        z.object({
          name,
          group: z.string().trim().max(50).default(""),
          admission: amount,
          monthly: amount,
          annualFund: amount,
        }),
      )
      .min(1)
      .max(20),
    streams: z
      .array(
        z.object({
          name,
          hindiName: z.string().trim().max(50).default(""),
          admission: amount,
          monthly: amount,
          annualFund: amount,
        }),
      )
      .min(1)
      .max(20),
  })
  .superRefine((value, ctx) => {
    for (const key of ["classes", "streams"] as const) {
      const names = value[key].map((row) => row.name.toLowerCase());
      if (new Set(names).size !== names.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: "Duplicate names are not allowed." });
      }
    }
  });

/**
 * DB se fees padho. DB error par **defaults return nahi karta** — warna user
 * outdated fees dekh kar galat amount pay kar sakta hai. Caller 503 deta hai
 * aur frontend saaf warning dikhata hai.
 */
export async function readFeeConfig(): Promise<FeeConfig> {
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

  if (!classes.length || !streams.length) {
    throw new Error("Fee structure data is incomplete");
  }
  return { classes, streams };
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
  try {
    const data = await readFeeConfig();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Fee config read error:", err);
    res.status(503).json({
      success: false,
      error:
        "Current fee information could not be loaded. Please confirm the latest fees with the school office before paying.",
    });
  }
});

router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await readFeeConfig();
    res.json({ success: true, data });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Fees could not be loaded from the database.") });
  }
});

router.put("/admin", requireAdmin, async (req: Request, res: Response) => {
  let validated: FeeConfig;
  try {
    validated = feeConfigSchema.parse(req.body) as FeeConfig;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    res.status(400).json({ success: false, error: "Invalid fee data" });
    return;
  }

  try {
    await saveFeeConfig(validated);
    // Transaction ke baad DB se wapas padho — success sirf tab jab data
    // actually persist ho gaya ho.
    const data = await readFeeConfig();
    res.json({ success: true, data, message: "Fees updated successfully" });
  } catch (err) {
    console.error("Fee config save error:", err);
    res.status(503).json({
      success: false,
      error: publicError(err, "Fees could not be saved. Please try again."),
    });
  }
});

export default router;

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { admissionEnquiriesTable } from "@workspace/db";
import { z } from "zod";

const router = Router();

const insertSchema = z.object({
	studentName: z.string().min(2),
	dob: z.string().min(1),
	gender: z.string().min(1),
	classApplying: z.string().min(1),
	stream: z.string().optional(),
	parentName: z.string().min(2),
	relation: z.string().optional(),
	phone: z.string().min(10),
	email: z.string().email().optional().or(z.literal("")),
	address: z.string().min(5),
	previousSchool: z.string().optional(),
	message: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const validated = insertSchema.parse(req.body);
		await db.insert(admissionEnquiriesTable).values({
			studentName: validated.studentName,
			dob: validated.dob,
			gender: validated.gender,
			classApplying: validated.classApplying,
			stream: validated.stream || null,
			parentName: validated.parentName,
			relation: validated.relation || null,
			phone: validated.phone,
			email: validated.email || null,
			address: validated.address,
			previousSchool: validated.previousSchool || null,
			message: validated.message || null,
			createdAt: new Date(),
		});
		res.status(201).json({ success: true, message: "Admission enquiry saved" });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
		} else {
			res.status(500).json({ success: false, error: err.message });
		}
	}
});

export default router;
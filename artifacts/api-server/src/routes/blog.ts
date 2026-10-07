import { Router, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";

const blogPostSchema = z.object({
	title: z.string().min(1).max(200),
	slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug me sirf lowercase letters, numbers aur hyphens ho sakte hain"),
	excerpt: z.string().max(500).default(""),
	content: z.string().min(1),
	// Upload se aaya hua image data URL (base64) — isliye limit badi rakhi hai.
	coverImage: z.string().max(7_000_000).default(""),
	category: z.string().max(100).default("General"),
	status: z.enum(["published", "draft"]).default("published"),
	author: z.string().max(100).default("BVPS"),
	publishedAt: z.union([z.string(), z.date()]).optional(),
});

function toDate(v: string | Date | undefined, fallback: Date): Date {
	if (!v) return fallback;
	const d = v instanceof Date ? v : new Date(v);
	return Number.isNaN(d.getTime()) ? fallback : d;
}

const router = Router();

// ── Public: published posts ──
router.get("/", async (_req: Request, res: Response) => {
	try {
		const rows = await db
			.select()
			.from(blogPostsTable)
			.where(eq(blogPostsTable.status, "published"))
			.orderBy(desc(blogPostsTable.publishedAt));
		res.json({ success: true, data: rows });
	} catch (err: any) {
		res.status(500).json({ success: false, error: err?.message ?? "Blog load failed" });
	}
});

// NOTE: "/admin" route ko "/:slug" se PEHLE declare karna zaroori hai,
// warna express "/admin" ko slug samajh kar 404 de deta hai.

// ── Admin: all posts (including drafts) ──
router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
	try {
		const rows = await db
			.select()
			.from(blogPostsTable)
			.orderBy(desc(blogPostsTable.updatedAt));
		res.json({ success: true, data: rows });
	} catch (err: any) {
		res.status(500).json({ success: false, error: err?.message ?? "Blog load failed" });
	}
});

// ── Admin: create ──
router.post("/admin", requireAdmin, async (req: Request, res: Response) => {
	try {
		const body = blogPostSchema.parse(req.body);
		const now = new Date();
		const [row] = await db
			.insert(blogPostsTable)
			.values({
				...body,
				publishedAt: toDate(body.publishedAt, now),
				createdAt: now,
				updatedAt: now,
			})
			.returning();
		res.json({ success: true, data: row, message: "Post created" });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
			return;
		}
		res.status(500).json({ success: false, error: err?.message ?? "Create failed" });
	}
});

// ── Admin: update ──
router.put("/admin/:id", requireAdmin, async (req: Request, res: Response) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0) {
		res.status(400).json({ success: false, error: "Invalid post id" });
		return;
	}
	try {
		const body = blogPostSchema.partial().parse(req.body);
		const [row] = await db
			.update(blogPostsTable)
			.set({
				...(body.title !== undefined && { title: body.title }),
				...(body.slug !== undefined && { slug: body.slug }),
				...(body.excerpt !== undefined && { excerpt: body.excerpt }),
				...(body.content !== undefined && { content: body.content }),
				...(body.coverImage !== undefined && { coverImage: body.coverImage }),
				...(body.category !== undefined && { category: body.category }),
				...(body.status !== undefined && { status: body.status }),
				...(body.author !== undefined && { author: body.author }),
				...(body.publishedAt !== undefined && { publishedAt: toDate(body.publishedAt as string | Date, new Date()) }),
				updatedAt: new Date(),
			})
			.where(eq(blogPostsTable.id, id))
			.returning();
		if (!row) {
			res.status(404).json({ success: false, error: "Post not found" });
			return;
		}
		res.json({ success: true, data: row, message: "Post updated" });
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			res.status(400).json({ success: false, error: err.errors });
			return;
		}
		res.status(500).json({ success: false, error: err?.message ?? "Update failed" });
	}
});

// ── Admin: delete ──
router.delete("/admin/:id", requireAdmin, async (req: Request, res: Response) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id <= 0) {
		res.status(400).json({ success: false, error: "Invalid post id" });
		return;
	}
	try {
		const [row] = await db
			.delete(blogPostsTable)
			.where(eq(blogPostsTable.id, id))
			.returning();
		if (!row) {
			res.status(404).json({ success: false, error: "Post not found" });
			return;
		}
		res.json({ success: true, message: "Post deleted" });
	} catch (err: any) {
		res.status(500).json({ success: false, error: err?.message ?? "Delete failed" });
	}
});

// ── Public: single published post by slug (sabse last - wildcard) ──
router.get("/:slug", async (req: Request, res: Response) => {
	try {
		const slug = String(req.params.slug ?? "");
		const [row] = await db
			.select()
			.from(blogPostsTable)
			.where(eq(blogPostsTable.slug, slug))
			.limit(1);
		if (!row || row.status !== "published") {
			res.status(404).json({ success: false, error: "Post not found" });
			return;
		}
		res.json({ success: true, data: row });
	} catch (err: any) {
		res.status(500).json({ success: false, error: err?.message ?? "Blog load failed" });
	}
});

export default router;
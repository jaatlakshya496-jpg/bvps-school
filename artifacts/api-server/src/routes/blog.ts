import { Router, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";
import { publicError } from "../lib/http";

const SAFE_IMAGE = /^(data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+|https:\/\/[^\s]+|\/[^\s]*)$/i;

const blogPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug me sirf lowercase letters, numbers aur hyphens ho sakte hain"),
  excerpt: z.string().trim().max(500).default(""),
  content: z.string().min(1).max(200_000),
  coverImage: z
    .string()
    .max(7_000_000)
    .refine((value) => value === "" || SAFE_IMAGE.test(value.trim()), "Cover image must be an https URL, relative path, or PNG/JPEG/WebP/GIF data URL")
    .default(""),
  category: z.string().trim().max(100).default("General"),
  status: z.enum(["published", "draft"]).default("published"),
  author: z.string().trim().max(100).default("BVPS"),
  publishedAt: z.union([z.string(), z.date()]).optional(),
});

function toDate(v: string | Date | undefined, fallback: Date): Date {
  if (!v) return fallback;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function pagination(req: Request, defaultLimit = 100) {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaultLimit));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  return { limit, offset };
}

function isUniqueViolation(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23505");
}

const router = Router();

// ── Public: published posts (content field intentionally omitted) ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit, offset } = pagination(req);
    const rows = await db
      .select({
        id: blogPostsTable.id,
        title: blogPostsTable.title,
        slug: blogPostsTable.slug,
        excerpt: blogPostsTable.excerpt,
        coverImage: blogPostsTable.coverImage,
        category: blogPostsTable.category,
        status: blogPostsTable.status,
        author: blogPostsTable.author,
        publishedAt: blogPostsTable.publishedAt,
        createdAt: blogPostsTable.createdAt,
        updatedAt: blogPostsTable.updatedAt,
      })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.status, "published"))
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(limit)
      .offset(offset);
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Blog list error:", err);
    res.status(503).json({ success: false, error: publicError(err, "Blog posts could not be loaded.") });
  }
});

// NOTE: "/admin" route ko "/:slug" se PEHLE declare karna zaroori hai,
// warna express "/admin" ko slug samajh kar 404 de deta hai.

// ── Admin: all posts (including drafts) ──
router.get("/admin", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit, offset } = pagination(req);
    const rows = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.updatedAt))
      .limit(limit)
      .offset(offset);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Blog posts could not be loaded.") });
  }
});

// ── Admin: create ──
router.post("/admin", requireAdmin, async (req: Request, res: Response) => {
  try {
    const body = blogPostSchema.parse(req.body ?? {});
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    if (isUniqueViolation(err)) {
      res.status(409).json({ success: false, error: "This slug is already used by another post." });
      return;
    }
    console.error("Blog create error:", err);
    res.status(503).json({ success: false, error: publicError(err, "Post could not be created.") });
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
    const body = blogPostSchema.partial().parse(req.body ?? {});
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
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    if (isUniqueViolation(err)) {
      res.status(409).json({ success: false, error: "This slug is already used by another post." });
      return;
    }
    console.error("Blog update error:", err);
    res.status(503).json({ success: false, error: publicError(err, "Post could not be updated.") });
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
    const [row] = await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id)).returning();
    if (!row) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Blog delete error:", err);
    res.status(503).json({ success: false, error: publicError(err, "Post could not be deleted.") });
  }
});

// ── Public: single published post by slug (wildcard sabse last) ──
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug ?? "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }
    const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug)).limit(1);
    if (!row || row.status !== "published") {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: row });
  } catch (err) {
    console.error("Blog post error:", err);
    res.status(503).json({ success: false, error: publicError(err, "Blog post could not be loaded.") });
  }
});

export default router;

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { siteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "../lib/admin-auth";
import { publicError } from "../lib/http";

/**
 * Website content editor ka backend (`site_content` key/value table).
 * Public GET kabhi fail nahi hota — DB down ho toh empty map return hota hai
 * aur frontend apne built-in defaults use karta hai (site blank na ho).
 */

const KEY_RE = /^[a-zA-Z0-9_.\-/]{1,120}$/;
const MAX_VALUE_CHARS = 20_000;
const IMAGE_KEY_PREFIX = "image.";
const MAX_IMAGE_VALUE_CHARS = 16_000_000;
const SAFE_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i;
const SAFE_REMOTE_IMAGE = /^https:\/\/[^\s]+$/i;

function maxCharsFor(key: string): number {
  return key.startsWith(IMAGE_KEY_PREFIX) ? MAX_IMAGE_VALUE_CHARS : MAX_VALUE_CHARS;
}

function isImageKey(key: string): boolean {
  return key.startsWith(IMAGE_KEY_PREFIX);
}

/** DB row -> JS value (JSON parse; galat data par raw string wapas). */
function decode(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * Content me kahin bhi `javascript:` / `data:text/html` jaisa URL na ho.
 * Image data URLs sirf allowed raster formats ke hote hain.
 */
function assertSafeValue(value: unknown, key: string, path = "value"): void {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed) || /^data:text\/html/i.test(trimmed)) {
      throw new Error(`Unsafe URL in "${key}" (${path})`);
    }
    if (/^data:/i.test(trimmed) && !SAFE_IMAGE_DATA_URL.test(trimmed)) {
      throw new Error(`Unsupported image format in "${key}" (${path})`);
    }
    if (/^https?:/i.test(trimmed) && !SAFE_REMOTE_IMAGE.test(trimmed) && !/^http:\/\/localhost/i.test(trimmed)) {
      throw new Error(`Invalid URL in "${key}" (${path})`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeValue(item, key, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      assertSafeValue(childValue, key, `${path}.${childKey}`);
    }
  }
}

export async function getContentMap(): Promise<Record<string, unknown>> {
  try {
    const rows = await db.select().from(siteContentTable);
    const out: Record<string, unknown> = {};
    for (const row of rows) {
      if (isImageKey(row.key)) continue;
      out[row.key] = decode(row.value);
    }
    return out;
  } catch (err) {
    console.error("site_content read error (using defaults):", err);
    return {};
  }
}

/** Sirf `image.*` keys — photos endpoint ke liye. */
export async function getImageMap(): Promise<Record<string, unknown>> {
  try {
    const rows = await db.select().from(siteContentTable);
    const out: Record<string, unknown> = {};
    for (const row of rows) {
      if (!isImageKey(row.key)) continue;
      out[row.key] = decode(row.value);
    }
    return out;
  } catch (err) {
    console.error("site_images read error (using defaults):", err);
    return {};
  }
}

const scalarValue = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const putSchema = z.object({
  items: z.record(z.string().regex(KEY_RE, "Invalid content key"), z.unknown()),
});

const router = Router();

/** Public — frontend content overrides. Images ismein include nahi. */
router.get("/", async (_req: Request, res: Response) => {
  const data = await getContentMap();
  res.json({ success: true, data });
});

/** Public — sirf `image.*` keys (gallery/hero photos). */
router.get("/images", async (_req: Request, res: Response) => {
  const data = await getImageMap();
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  res.json({ success: true, data });
});

/** Admin — keys ke saath updatedAt bhi (UI "last edited" dikhata hai). */
router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(siteContentTable);
    const data: Record<string, unknown> = {};
    const meta: Record<string, string> = {};
    for (const row of rows) {
      if (isImageKey(row.key)) continue;
      data[row.key] = decode(row.value);
      meta[row.key] = new Date(row.updatedAt).toISOString();
    }
    res.json({ success: true, data, meta });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Website content could not be loaded.") });
  }
});

/** Admin — ek saath bahut saare keys upsert karo. */
router.put("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { items } = putSchema.parse(req.body);
    const entries = Object.entries(items as Record<string, unknown>);
    if (!entries.length) {
      res.json({ success: true, data: await getContentMap(), message: "Kuch nahi badla." });
      return;
    }

    for (const [key, value] of entries) {
      const encoded = JSON.stringify(value ?? null);
      if (encoded.length > maxCharsFor(key)) {
        res.status(400).json({
          success: false,
          error: `"${key}" ki value bahut badi hai (max ${maxCharsFor(key)} characters).`,
        });
        return;
      }

      if (isImageKey(key)) {
        // Image keys string (single photo) ya config object (gallery/hero) ho sakti hain.
        if (value !== null && typeof value !== "string" && typeof value !== "object") {
          res.status(400).json({ success: false, error: `"${key}" must be an image string or config object.` });
          return;
        }
        assertSafeValue(value, key);
      } else {
        if (!scalarValue.safeParse(value).success) {
          res.status(400).json({
            success: false,
            error: `"${key}" only supports text/number/boolean values.`,
          });
          return;
        }
        assertSafeValue(value, key);
      }
    }

    await db.transaction(async (tx: any) => {
      for (const [key, value] of entries) {
        await tx
          .insert(siteContentTable)
          .values({ key, value: JSON.stringify(value ?? null), updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteContentTable.key,
            set: { value: JSON.stringify(value ?? null), updatedAt: new Date() },
          });
      }
    });
    res.json({ success: true, data: await getContentMap(), message: "Website content updated." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    console.error("site_content save error:", err);
    res.status(503).json({ success: false, error: publicError(err, "Website content could not be saved.") });
  }
});

/** Admin — ek key hatao (default value wapas aa jaati hai). */
router.delete("/:key", requireAdmin, async (req: Request, res: Response) => {
  const key = String(req.params.key ?? "");
  if (!KEY_RE.test(key)) {
    res.status(400).json({ success: false, error: "Invalid content key" });
    return;
  }
  try {
    await db.delete(siteContentTable).where(eq(siteContentTable.key, key));
    res.json({ success: true, data: await getContentMap(), message: `"${key}" reset ho gaya.` });
  } catch (err) {
    res.status(503).json({ success: false, error: publicError(err, "Content could not be reset.") });
  }
});

export default router;

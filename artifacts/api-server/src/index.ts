import "./env";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Render par start command `cd artifacts/api-server` karta hai, isliye
 * `process.cwd()/lib/db/drizzle` galat path tha aur startup migration chup-chap
 * fail ho jaati thi. Ab source aur bundled dist dono ke liye repo root resolve
 * karte hain.
 */
function findMigrationsFolder(): string | null {
  const candidates = [
    process.env.MIGRATIONS_DIR,
    path.resolve(process.cwd(), "lib/db/drizzle"),
    path.resolve(process.cwd(), "../../lib/db/drizzle"),
    path.resolve(process.cwd(), "../lib/db/drizzle"),
    fileURLToPath(new URL("../../../lib/db/drizzle", import.meta.url)),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "meta", "_journal.json"))) return candidate;
  }
  return null;
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    logger.warn("DATABASE_URL missing - skipping migrations");
    return;
  }
  const migrationsFolder = findMigrationsFolder();
  if (!migrationsFolder) {
    logger.error("Database migrations folder not found; server will start without applying migrations");
    return;
  }
  try {
    await migrate(db, { migrationsFolder });
    logger.info({ migrationsFolder }, "Database migrations applied");
  } catch (err) {
    // DB down ho toh server phir bhi start rahe (health endpoint ke liye), par
    // error clearly log ho — warna pata nahi chalega ki schema purana hai.
    logger.error({ err }, "Database migration failed");
  }
}

runMigrations().finally(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
});

import "./env";
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    logger.warn("DATABASE_URL missing - skipping migrations");
    return;
  }
  try {
    const migrationsFolder = path.resolve(process.cwd(), "lib/db/drizzle");
    await migrate(db, { migrationsFolder });
    logger.info({ migrationsFolder }, "Database migrations applied");
  } catch (err) {
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

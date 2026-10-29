import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let db: any;
let pool: any;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: 20_000,
      application_name: "bvps-api",
    });
    // Idle client errors process ko crash na karein (Render par important).
    pool.on("error", (err: Error) => {
      console.error("[@workspace/db] idle client error:", err.message);
    });
    db = drizzle(pool, { schema });
  } else {
    throw new Error("No DATABASE_URL provided");
  }
} catch {
  const message =
    "Database not configured: DATABASE_URL is missing. Set it in environment variables (Render) or lib/db/.env.";
  console.warn("[@workspace/db] " + message);
  const failChain: any = () => {
    throw new Error(message);
  };
  db = new Proxy({}, { get: () => failChain });
  pool = {
    query: failChain,
    connect: async () => {
      throw new Error(message);
    },
    on: () => undefined,
  };
}

export { pool, db };
export * from "./schema";

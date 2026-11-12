/**
 * Managed/Supabase Postgres ke liye SSL resolve karta hai.
 *
 * Rules:
 * - `DATABASE_SSL=true`  → TLS on, certificate chain check relaxed
 *   (`rejectUnauthorized: false`) — Supabase/pooler hosts par Node ke bundled
 *   CA se verify fail hota hai.
 * - Connection string ke host me "supabase" ho → same treatment (user ko
 *   extra env var na lagana pade).
 * - URL me `sslmode=disable` ya `DATABASE_SSL=false` → SSL off.
 * - Baaki sab (local Postgres, purana Render) → SSL off — local non-SSL
 *   setups pehle jaise hi chalte rahenge.
 */
export type DbSsl = { rejectUnauthorized: false } | undefined;

export function resolveSsl(
  connectionString: string,
  envSsl?: string,
): DbSsl {
  let host = "";
  let sslmode = "";
  try {
    const parsed = new URL(connectionString);
    host = (parsed.hostname || "").toLowerCase();
    sslmode = (parsed.searchParams.get("sslmode") ?? "").toLowerCase();
  } catch {
    // Malformed/unusual URL — sirf env flag par rely karo.
  }
  if (sslmode === "disable") return undefined;
  if (envSsl === "false") return undefined;
  if (envSsl === "true" || host.includes("supabase") || sslmode === "require") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Local development ke liye `.env` load karo. Production me Render env vars
 * directly milte hain, isliye ye optional hai.
 */
function loadEnvFile(envPath: string) {
  if (!existsSync(envPath)) return false;
  try {
    // Node 20.12+ me built-in loader available hai.
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(envPath);
      return true;
    }
    // Purane Node ke liye simple KEY=VALUE parser.
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      if (process.env[key] !== undefined) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
    return true;
  } catch {
    return false;
  }
}

for (const envPath of [join(process.cwd(), "lib/db/.env"), join(process.cwd(), ".env")]) {
  if (loadEnvFile(envPath)) break;
}

import { existsSync } from "node:fs";
import { join } from "node:path";

for (const envPath of [join(process.cwd(), "lib/db/.env"), join(process.cwd(), ".env")]) {
  if (existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
      break;
    } catch {
      // ignore invalid/missing env files; rely on real environment variables
    }
  }
}
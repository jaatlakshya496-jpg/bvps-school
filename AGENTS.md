# AGENTS.md — BVPS School Website

Is file ka uddeshya: site ke saare **changes/decisions** ko track karna taaki bhavishya mein ham saare kaam is file ke hisaab se karein.

## Project Structure
- **Monorepo (npm workspaces)**: `artifacts/*`, `lib/*`, `scripts`
- Main website: `@workspace/bvps-website` (`artifacts/` folder mein)
- Backend/API specs: `lib/api-spec`, generated clients in `lib/api-client-react`, `lib/api-zod`
- Database: `lib/db` (Drizzle + PostgreSQL)
- Config/tsconfig: `tsconfig.base.json`, `tsconfig.json`

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Start/serve: `npm run start`
- Lint/typecheck: `npm run lint` (`tsc --noEmit`)

## Deployment
- Frontend hosting: **Vercel** (CLI install: `pnpm i -g vercel`)
- Project: `bal-vikas/bvps-school` — Production URL: https://bvps-school.vercel.app
- Deploy cmd: `vercel --prod --yes` (ya `vercel` preview ke liye)
- Config: `vercel.json` (framework vite, build `npm run build`, output `dist`)
- Vercel account: `jaatlakshya496-7056`

## Changelog (Changes/Decisions)
- **[2026-09-02]** AGENTS.md file add ki (tracking ke liye).
- **[2026-09-02]** Vercel CLI install kiya (`pnpm i -g vercel`).
- **[2026-09-02]** Node_modules corrupt tha → sabhi workspace node_modules + lockfile delete kar ke clean `npm install` (dependencies fix).
- **[2026-09-02]** `vercel.json` add kiya (framework: vite, buildCommand: `npm run build`, output: `dist`, installCommand: `npm install`).
- **[2026-09-02]** Frontend production deploy Vercel par ✅ — Production URL: https://bvps-school.vercel.app
- **[2026-09-03]** Backend Render deploy fix — `render.yaml` + `package-lock.json` pehle git mein committed NAHI the, isliye Render build fail ho raha tha. Dono commit kar ke push kiya. `render.yaml` mein `nodeVersion: 20` aur `NODE_ENV: production` add kiya. `esbuild-plugin-pino` peer dep mismatch `legacy-peer-deps=true` (`.npmrc`) se handle hai.

## To-Do Notes
- (Yahan pending kaam note karein)

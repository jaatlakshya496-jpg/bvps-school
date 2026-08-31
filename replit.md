# BVPS Kalayat — School Website

Bal Vikas Public School, Kalayat (District Kaithal, Haryana). A co-educational school for Classes 1–12, established 2004.

## Project structure

This is a pnpm monorepo with two runnable artifacts and shared libraries:

| Path | Purpose |
|------|---------|
| `artifacts/bvps-website` | React + Vite public-facing school website |
| `artifacts/api-server` | Express API server (health check + future endpoints) |
| `artifacts/mockup-sandbox` | Design canvas / component preview (internal tooling) |
| `lib/db` | Drizzle ORM database layer |
| `lib/api-spec` | Shared API spec |
| `lib/api-zod` | Shared Zod schemas |
| `lib/api-client-react` | React Query API client |

## How to run

Both services start automatically via configured workflows:

- **Website** (`artifacts/bvps-website: web`): `pnpm --filter @workspace/bvps-website run dev`
- **API Server** (`artifacts/api-server: API Server`): `pnpm --filter @workspace/api-server run dev`

Install dependencies: `pnpm install`

## Pages

Home · About Us · Facilities · Gallery · Admissions · Contact · Feedback

## User preferences

<!-- Add remembered preferences here -->

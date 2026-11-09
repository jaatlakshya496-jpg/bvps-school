# Bal Vikas Public School (BVPS), Kalayat

[![Website](https://img.shields.io/badge/Live%20Website-bvps--school.vercel.app-111C2E)](https://bvps-school.vercel.app)
[![HBSE/BSEH](https://img.shields.io/badge/Board-BSEH%20%7C%20HBSE-blue)](https://bseh.org.in)

Bal Vikas Public School, Railway Road, Kalayat, Kaithal, Haryana — a co-educational school affiliated to Board of School Education Haryana (BSEH/HBSE), established in 2004. Classes 1 to 12.

## Visit Website
- Production: https://bvps-school.vercel.app
- School Code: 11498 | Establishment: 2004

## Quick Links
- [Home](https://bvps-school.vercel.app/) — Hero, achievements, gallery
- [About](https://bvps-school.vercel.app/about) — History, vision, mission, infrastructure
- [Academics](https://bvps-school.vercel.app/academics) — Curriculum, teaching, streams
- [Streams](https://bvps-school.vercel.app/streams) — Medical, Non-Medical, Commerce
- [Admissions](https://bvps-school.vercel.app/admissions) — Criteria, documents, process
- [Fee Structure](https://bvps-school.vercel.app/fee-structure) — Classes 1–12 (2026–27)
- [Facilities](https://bvps-school.vercel.app/facilities) — Smart classrooms, library, labs, playground
- [Gallery](https://bvps-school.vercel.app/gallery) — Campus, events, achievements
- [Results](https://bvps-school.vercel.app/results) — Academic & sports excellence
- [Blog](https://bvps-school.vercel.app/blog) — School news & updates
- [Contact](https://bvps-school.vercel.app/contact) — Map, phone, email
- [Principal Message](https://bvps-school.vercel.app/principal-message) — Write to Principal

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express (Node.js) — API for forms, chat, fees, blog, content
- DB: PostgreSQL + Drizzle ORM
- Hosting: Vercel (frontend), Render (API + DB)
- AI: Groq (chatbot, GPT OSS 20B)

## Public Assets
| Image | Path | Purpose |
|---|---|---|
| School logo (WebP) | `/assets/school-logo-kalayat-Blj0DkE6.webp` (hashed) / `/school-logo.webp` (public) | Navbar/footer logo |
| School logo (PNG) | `/school-logo.png` | Fallback |
| OG image (1200×630) | `/og-bvps.jpg` | Social previews (WhatsApp/Facebook/LinkedIn/X) |
| Favicon SVG/PNG | `/favicon.svg`, `/favicon-192.png`, `/favicon-512.png` | Browser icons |
| Apple Touch Icon | `/apple-touch-icon.png` | iOS homescreen |
| Web App Manifest | `/manifest.webmanifest` | PWA |

All public images: see `artifacts/bvps-website/public/` folder.

## Forms & Notifications
- Contact, Admission, Feedback, Principal Message
- Email: Resend (primary), FormSubmit.co (fallback) → `jaatlakshya496@gmail.com`
- WhatsApp: CallMeBot (if configured) → `+91 9671772205`

## Admin
Admin portal: `/admin` (private — login required). Email/password configured via Render env vars.

## SEO
- Per-route prerender + sitemap.xml + robots.txt
- Structured data (School + BreadcrumbList)
- Open Graph + Twitter Cards
- Canonical URLs per page
- Crawlable static shell per page (`src/lib/prerender-shells.json` → `scripts/prerender-seo.mjs`)

## Architecture
- Monorepo: `artifacts/api-server` (Express + TS API), `artifacts/bvps-website` (Vite + React + Tailwind), `lib/db` (Drizzle + Postgres), `lib/api-zod` (zod schemas).
- Frontend calls backend via `/api/*`; Vercel rewrites them to the Render API.
- DB schema/migrations: `lib/db/drizzle`.

## Environment Variables

### Backend (`artifacts/api-server` — Render, private env only)
| Key | Purpose | Example / note |
|---|---|---|
| `NODE_ENV` | production | `production` |
| `PORT` | listen port | `10000` |
| `DATABASE_URL` | Postgres (from Render DB) | `postgres://…` |
| `ADMIN_EMAIL` | admin login email | owner Gmail |
| `ADMIN_PASSWORD` | admin login password | strong password |
| `ADMIN_SECRET` | admin passcode / legacy key | strong secret |
| `ADMIN_SESSION_SECRET` | session signing secret | strong secret (preferred) |
| `ALLOW_LEGACY_ADMIN_KEY` | legacy `x-admin-key` on/off | `true` only if needed |
| `CORS_ORIGINS` | allowed origins (comma list) | `https://bvps-school.vercel.app` |
| `NOTIFY_EMAIL` | owner email (notify) | owner Gmail |
| `NOTIFY_WHATSAPP` | owner WhatsApp (callmebot) | `+91…` |
| `RESEND_API_KEY` | email fallback | key |
| `CALLMEBOT_APIKEY` | WhatsApp alerts | key |
| `SITE_ORIGIN` | public site origin | `https://bvps-school.vercel.app` |
| `GROQ_API_KEY` | chatbot | key |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | legacy notify | not used for primary now |

### Frontend (`artifacts/bvps-website` — Vercel build env)
| Key | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL (default `https://bvps-school-1.onrender.com`) |

Secrets: `.env.example` me empty placeholders hain; real values sirf private hosting env me.

## Development
```bash
npm install
npm run dev
npm run build
npm run lint
```

## Deploy
- Frontend: Vercel (`bvps-school`) — build `npm run build`, output `dist`, rewrites `/api/*` → Render.
- Backend: Render (`bvps-api`) — build `npm install && npm run build --workspace=@workspace/api-server`, migrate, start `cd artifacts/api-server && node ./dist/index.mjs`.
- Health: `https://bvps-school-1.onrender.com/health` (cron/uptime monitor ke liye).

## Contact
Bal Vikas Public School
Railway Road, Kalayat (Kaithal), Haryana – 136117, India
Phone: +91 98125 50200 | +91 96717 72205
Email: info@bvpskalayat.edu.in
Website: https://bvps-school.vercel.app

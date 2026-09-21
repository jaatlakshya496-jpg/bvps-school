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
- **[2026-09-03]** Cron/uptime health URL add ki — `app.ts` mein root `/` aur `/health` endpoints add kiye jo hamesha 200 return karte hain. `.onrender.com/` pehle 404/timeout deta tha isliye cron job error aa raha tha. Ab cron ke liye `https://bvps-school-1.onrender.com/` (ya `/health`) use karo.
- **[2026-09-03]** Frontend Vercel pe verified — live URL https://bvps-school.vercel.app serving BVPS SPA (title "Bal Vikas Public School, Kalayat (BVPS)"). `main` branch GitHub → Vercel auto-deploy hai (`bal-vikas/bvps-school`).
- **[2026-09-03]** Important architecture note — **Frontend abhi backend (Render) se connect NAHI hai.** Chatbot, admission form, feedback sab CLIENT-SIDE hain:
  - Chatbot (`UnifiedAiAgent.tsx`, `VoiceBot.tsx`) = hardcoded knowledge base + browser Web Speech API (kisi API call ki zaroorat nahi).
  - Forms (`enquiry-store.ts`, `feedback-store.ts`) = `localStorage` me save hote hain.
  - Isliye chatbot/form Vercel pe bina backend ke kaam karte hain. Backend (Render) sirf health endpoints provide karta hai abhi.
- **[2026-09-08]** Contact form email sending add ki — naya backend endpoint `POST /contact-email` (`contact-email.ts`) jo Gmail SMTP (nodemailer) se email bhejta hai. `GMAIL_USER` aur `GMAIL_APP_PASSWORD` env vars required hain (Render pe set karne hain). Frontend `contact.tsx` ab `/contact` nahi `/contact-email` call karta hai. ⚠️ Render pe GMAIL env vars set karna baaki hai — warna contact form 500 dega.
- **[2026-09-14]** 🚨 GMAIL_APP_PASSWORD galti se `render.yaml` mein public repo mein commit ho gaya tha (commit 9631d76) aur GitHub par 2 din tak raha. **Fix (16-Sep):** commit drop kar ke force-push kiya (branch ab 92c6c1d par hai), local git objects purge kiye, aur `render.yaml` ki GMAIL env vars wapas `sync: false` karke manual dashboard setup ke liye restore ki. ⚠️ Naya Gmail app password banana zaroosi hai (purana compromised hai).
- **[2026-09-17]** Render API se `bvps-school-1` service (`srv-dab9vics728c73a2p9lg`) par env vars set kiye via API: `GMAIL_USER` (jaatlakshya496@gmail.com) aur `GMAIL_APP_PASSWORD` (purana compromised password — user ne use karne ka kaha; ⚠️ jald se naya password rotate karna chahiye) aur API se manual deploy trigger kiya.
- **[2026-09-17]** Contact form WhatsApp link add — `contact-email.ts` ab success response mein `whatsappUrl` deta hai (`https://wa.me/919671772205?text=...`, admin number 9671772205). Frontend `contact.tsx` success card mein "Send same message on WhatsApp" button dikhata hai. ✅ Commit + push ho gaya (85f3192).
- **[2026-09-17]** 🚨 **Bada finding:** Render **free** web services outbound SMTP ports (25/465/587) block karte hain (Sept 2025 se) — isliye Gmail SMTP (nodemailer) se email kabhi nahi jayega. Local par SMTP OK tha, Render par 20s timeout. Fix: `contact-email.ts` ko HTTP-based banaya:
  - **Email** → FormSubmit.co AJAX (`https://formsubmit.co/ajax/<admin email>`) — koi API key nahi, sirf ek baar Gmail par activation link click karna hai.
  - **WhatsApp** → CallMeBot API (`https://api.callmebot.com/whatsapp.php?phone=+919671772205&apikey=<CALLMEBOT_APIKEY>`) — admin ke WhatsApp par direct automatic message. Env var `CALLMEBOT_APIKEY` chahiye (ek baar bot ko "I allow callmebot to send me messages" bhej kar milta hai).
  - Endpoint resilient hai: ek channel fail ho par doosra success ho toh bhi 200 + WhatsApp link milta hai. Response mein `emailSent`/`whatsappSent` flags hain.
  - ⚠️ ntfy.sh push wala tarika (17-Sep) hataya gaya kyunki user WhatsApp chahta tha.
  - ⚠️ GMAIL_USER/GMAIL_APP_PASSWORD ab use nahi hote (Render free par block) — env vars pade rehne dete hain.

- **[2026-09-18]** ✅ **Manual fee editing add ki** — Fee page (`fee-structure.tsx`) par "Manage Fees" button (mobile par bhi) → admin passcode (`ADMIN_SECRET`) daal kar fees manually change ho sakti hain; website par live update.
  - **DB:** nayi table `fee_structure` (`lib/db/src/schema/index.ts` + migration `0003_fee_structure.sql`). Classes + 3 streams ke admission/monthly/annualFund numeric store hote hain. Total/year auto = monthly×12 + annualFund.
  - **API:** `GET /api/fees` (public, empty ho toh built-in defaults), `GET /api/fees/admin` (verify passcode), `PUT /api/fees/admin` (save; `x-admin-key` header). Naya `lib/admin-auth.ts` shared `requireAdmin`, `admin.ts` usi ko use karta hai.
  - **Fallback:** API/DB down ho toh page built-in default fees dikhata hai (site kabhi na toote).
  - ⚠️ **Live (18-Sep):** Render pe `ADMIN_SECRET='BVPS@2026'` set kiya + migration startup par chalti hai (`index.ts` mein `migrate()` se `lib/db/drizzle` — Render ke `preDeployCommand` se reliable nahi tha). Deploy trigger hua, `PUT /api/fees/admin` verified OK. Frontend Vercel live. 🔑 Site pe passcode: **BVPS@2026** (badalna ho toh Render → service → Env Vars → `ADMIN_SECRET`).
- **[2026-09-21]** 🕶️ **Owner-only fee editor (hidden access)** — fee-structure page par "Manage Fees" button public ke liye **hidden** kar diya. Ab admin access 3 tarikon se milta hai:
  - **Secret URL:** site pe `?admin=1` ya `#admin` lagao (e.g. `https://bvps-school.vercel.app/fee-structure?admin=1`) — page khulte hi admin modal khul jayega.
  - **5 tap trick:** hero heading "Fee Structure" par mobile pe 5 quick taps — admin modal khulta hai.
  - **Persistent session:** passcode unlock hone ke baad key `localStorage` (`bvps_admin_key`) mein save hoti hai, isliye browser + refresh ke baad bhi "Edit Fees"/"Manage Fees" buttons + floating edit button dikhte hain. (Pehle `sessionStorage` tha → tab band hote hi gayab ho jaata tha.)
  - Owner logged-in hone par 3 controls: hero table ke paas "Manage Fees", mobile par "Manage Fees", aur bottom-right floating "Edit Fees" pencil button.
  - Admin modal khulte waqt `GET /api/fees/admin` se latest DB fees auto-load hoti hain (agar key pehle se hai).

## To-Do Notes
- ⚠️ **CallMeBot activation** — admin (9671772205) ko WhatsApp par bot number (e.g. +34 644 95 42 75) ko save kar ke "I allow callmebot to send me messages" bhejna hai; phir mila APIKEY `CALLMEBOT_APIKEY` env var mein Render par set karna hai. Iske bina WhatsApp automatic message nahi jayega.
- ⚠️ **FormSubmit activation** — jaatlakshya496@gmail.com par FormSubmit ka "Activate Form" email aaya hai; uska link click karna baaki hai. Iske bina email nahi jayega (`emailSent: false` rahega).
- ⚠️ **naya Gmail app password** abhi bhi rotate karna hai (purana compromised tha; Render free par SMTP block hai isliye abhi zaroorat nahi, par rotate kar lo).
- ⚠️ Render API key (`rnd_fj9gv5IMZwG2RhiuCnS2w3pzBZuJ`) user ne chat mein share ki thi — kaam khatam hone ke baad revoke kar dena (Render → Account Settings → API Keys → Revoke).

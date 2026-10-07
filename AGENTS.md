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
  - Owner logged-in hone par 4 controls: page ke top par "Manage Fees", hero table ke paas "Manage Fees", mobile par "Manage Fees", aur bottom-right floating "Edit Fees" pencil button.
  - Admin modal khulte waqt `GET /api/fees/admin` se latest DB fees auto-load hoti hain (agar key pehle se hai).
- **[2026-09-24]** 🗂️ **Admin Portal + Blog system** (code push ho gaya, deploy baaki):
  - **`/admin` portal** (website layout se alag, apna login): Dashboard (counts + recent), Blog (list + editor), Fee Structure (wahi fee editor admin view mein), Messages (contact / admission / feedback + delete). Footer me "🔒 Admin Login" link.
  - **Auth:** `POST /api/admin/login` email+password (`ADMIN_EMAIL`, `ADMIN_PASSWORD` env) → wahi `ADMIN_SECRET` token return karta hai jo baaki admin endpoints ke `x-admin-key` header me use hota hai. `GET /api/admin/status` se token verify. Token browser me `localStorage` (`bvps_admin_key` / `bvps_admin_email`).
  - **Blog:** nayi table `blog_posts` (`lib/db/src/schema/index.ts` + migration `0004_blog_posts.sql`). Public `GET /api/blog` + `GET /api/blog/:slug` (sirf `published`), admin CRUD `GET/POST /api/blog/admin`, `PUT/DELETE /api/blog/admin/:id`. Public pages `/blog` (list) + `/blog/:slug` (post), Navbar + Footer + 3 languages (EN/HI/Punjabi) me link.
  - **Fee page fix:** "Manage Fees" button ab owner-only nahi — hero ke **top-right hamesha visible** (`top-24 right-4`), passcode hi asli gate hai.
  - ⚠️ **Deploy baaki hai:** Render par `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars set karne hain (warna login 500 dega) + deploy (migration `0004` startup par chalti hai), phir Vercel frontend deploy.
- **[2026-09-30]** ✅ **Admin portal + blog DEPLOY ho gaya** (Render auto-deploy on commit + Vercel auto-deploy dono trigger hue):
  - Render par `ADMIN_EMAIL=jaatlakshya496@gmail.com` aur naya random `ADMIN_PASSWORD` set kiya (Render API se, purane leaked key se). `POST /api/admin/login` → 200 verified, `GET /api/admin/status` + `GET /api/fees/admin` bhi OK.
  - ⚠️ **`ADMIN_SECRET` Render par `LAXYAMALIK` hai** (AGENTS.md me likha `BVPS@2026` galat tha) — yahi fee editor ka passcode hai.
  - **Blog route-order bug fix:** `GET /:slug` route `/admin` se pehle declare tha → `GET /api/blog/admin` 404 de raha tha. Ab admin routes pehle, wildcard `/:slug` sabse last.
  - ⚠️ **`GROQ_API_KEY` Render par set NAHI hai** → `POST /api/chat` 503 de raha hai (chatbot kaam nahi kar raha). Key console.groq.com se lekar Render dashboard me daalni hogi.
- **[2026-09-30]** 🤖 **Chatbot fix + contact form me DB save** (dono deploy ho gaye):
  - `GROQ_API_KEY` Render par set kar diya (user ne diya) → `POST /api/chat` ab 200, Groq `openai/gpt-oss-20b` se jawab de raha hai.
  - **Contact form ka bada bug fix:** `POST /contact-email` sirf email/WhatsApp bhejta tha, **DB me save hi nahi karta tha** — to email fail hone par enquiry puri tarah gum ho jati thi (admin portal me dikhti bhi nahi). Ab `contact-email.ts` pehle `contact_submissions` me insert karta hai (admission/feedback jaisa resilient pattern), phir notify karta hai. Response me `savedToDb` flag bhi aa gaya.
  - **Message channel decision (user ne 30-Sep ko chuna): email (FormSubmit) primary rahega** — WhatsApp ka CallMeBot path deactivate (key nahi mili). `sendWhatsApp` ab key na hone par chup chap skip karta hai. Form me "Send on WhatsApp" manual link phir bhi kaam karta hai.
  - ⚠️ **Email abhi bhi nahi chal rahi:** FormSubmit activation pending (`formsubmit.co/ajax/...` → 500). Tab tak **sabhi enquiries DB me safe hain** aur admin portal → Messages me dikhengi — koi data loss nahi.
- **[2026-09-30]** 🔑 **Admin password = `LAXYAMALIK`** (user ne khud set karwaya, `ADMIN_SECRET` ke barabar):
  - Render par `ADMIN_PASSWORD=LAXYAMALIK` set kiya + deploy. `POST /api/admin/login` (jaatlakshya496@gmail.com / LAXYAMALIK) → 200 verified.
  - Site ka admin portal: **https://bvps-school.vercel.app/admin** — footer ke **sabse neeche** "Administration & Management → Admin Login" (pehle bahut chhota/dim link tha, isliye dikhta nahi tha; ab full-width visible bar me hai).
  - Fee editor ka passcode bhi yahi `LAXYAMALIK` hai ( dono ek hi value).
- **[2026-09-30]** 🐛 **Admin portal ka 404 fix + footer me Admin link**:
  - **Root cause:** wouter me wildcard `:rest*` kaam nahi karta — `regexparam` usay literal param naam samajhta hai. `parse('/admin/:rest*')` sirf `/admin/blog` (ek segment) match karta tha; `/admin/blog/new` aur `/admin/blog/:id/edit` match **hi nahi** hote the → wahan se `PublicRouter` ka `NotFound` page ("404 Page Not Found") aa raha tha. Fix: `path="/admin/*"` (regexparam v3 ka sahi wildcard).
  - **NotFound page ab user-friendly:** dev message hata ke "Page Not Found" + Home/Contact buttons.
  - **Footer:** Quick Links list me "🔒 Admin Login" **"Write to Principal" ke bilkul neeche** add kiya (same style), + footer ke sabse neeche full-width amber ADMIN LOGIN bar.
  - ⚠️ wouter me nested route ke liye hamesha `/admin/*` likho, `:param*` kabhi nahi.
- **[2026-09-30]** 📨 **Principal message form ab real + admin portal PRIVATE**:
  - **Bada bug:** "Write to Principal" form (`/principal-message#message-form`) sirf visitor ke apne browser `localStorage` me save hota tha — koi API call hi nahi tha, matlab **Principal tak message pahunchta hi nahi tha**. Ab `principal-message.tsx` real `POST /api/principal-messages` call karta hai (fail par toast error).
  - **DB:** nayi table `principal_messages` (`lib/db/src/schema/index.ts` + migration `0005_principal_messages.sql`). Columns: sender_name, sender_role, phone, email, category, subject, message, status, created_at.
  - **API:** public `POST /api/principal-messages` (pehle DB insert, phir email notify — `savedToDb`/`emailSent` flags). Admin `GET /api/admin/principal` + `DELETE /api/admin/principal/:id`.
  - **Admin Messages tabs ab 4:** **Admission Contact** | **Principal Message** | Contact Messages | Feedback. Principal ka message "Principal Message" tab me, admission ka "Admission Contact" tab me.
  - **🔒 Admin portal PRIVATE kar diya:** footer se **saare admin links hata diye** (Quick Links list + neeche ka amber ADMIN LOGIN bar) — ab koi visitor ko admin dikhai nahi deta. Admin sirf secret URL se khulta hai: `https://bvps-school.vercel.app/admin`, aur login ke liye email+password zaroori hai. Page par `<meta name="robots" content="noindex, nofollow, noarchive">`.
  - ⭐ **Admin khud ke liye yaad rakho:** URL `https://bvps-school.vercel.app/admin` · email `jaatlakshya496@gmail.com` · password `LAXYAMALIK` (ye `ADMIN_SECRET` ke barabar hai, isi liye fee editor ka "Manage Fees" passcode bhi yahi chalta hai).
  - ⚠️ `principal-message-store.ts` ka `savePrincipalMessage()` ab use nahi hota (sirf type rakha gaya hai) — naye form me localStorage fallback nahi hai, kyunki wahi thi jiski wajah se message gum ho jata tha.

- **[2026-09-27]** 💬 **Groq-backed receptionist chatbot add kiya** — purane hardcoded voice assistant ko replace karke `ChatbotWidget.tsx` global floating chat widget add kiya. Widget recent history ke saath existing Render API ke `POST /api/chat` route ko call karta hai; browser kabhi Groq ko direct call nahi karta. Backend `openai/gpt-oss-20b` use karta hai, `GROQ_API_KEY` environment variable se read hota hai, aur verified BVPS site facts ke saath short multilingual receptionist prompt use karta hai. `render.yaml` mein key `sync: false` hai. `.gitignore` mein `.ENV` bhi add kiya gaya hai.
- **[2026-09-27]** 🖼️ **Image-on-request behavior add kiya** — normal chatbot answers text-only rahenge. Visitor jab photo, picture, image ya gallery explicitly maangega tab API image IDs return karegi aur frontend relevant BVPS campus/student/facility photos dikhayega.

- **[2026-10-01]** 🐛 **Chatbot fix (left corner + hamesha working) + admin portal mobile fix**:
  - **Chatbot position:** launcher ab **bottom-LEFT** corner me hai (`ChatbotWidget.tsx`) — pehle right side me tha jahan WhatsApp button se takra raha tha. Chat panel bhi left anchored hai; desktop par "Ask BVPS" / "Need help?" labels dikhte hain.
  - **Chatbot "kaam nahi kar raha" fix** — ab 4 layers se chalta hai:
    1. **Warm-up ping:** page load + chat open karne par `${API}/health` par silent ping (Render free service idle ke baad so jata hai; cold start 30–60s).
    2. **Timeout + 1 retry:** 45s `AbortController` timeout, fail par 1.5s baad automatic retry.
    3. **Offline knowledge base (naya `src/lib/school-kb.ts`):** Render/Groq se jawab na aaye toh verified school info se rule-based jawab (admission/fee/timing/streams/facilities/documents/contact/gallery/blog/transport/feedback) — English ya Hindi/Hinglish (auto-detect), page-link button + (photo maange toh) campus photos + Retry/Call office buttons. **Dead-end "unavailable" message ab nahi milega.**
    4. **Server hardening (`routes/chat.ts`):** `GROQ_MODELS = ["openai/gpt-oss-20b", "llama-3.3-70b-versatile"]` fallback + 25s `AbortSignal.timeout` — ek model retire/lag kare toh doosra chalta hai.
  - **Admin portal MOBILE fix** (`AdminLogin.tsx`, `AdminPortal.tsx`):
    - Login card par `overflow-hidden` + center alignment ki wajah se **mobile par keyboard khulte hi card screen se bahar chala jata tha** (Login button dabba hi nahi hota tha). Ab `min-h-[100dvh]`, top-aligned (`items-start sm:items-center`), `overflow-y-auto`, `text-base` inputs.
    - Portal layout mobile par compact top-bar + horizontally scrollable nav (Logout sidebar me, header me "Site" link); desktop sidebar waisa hi. `min-h-screen` → `min-h-[100dvh]`.
  - **Admin portal mobile tak pahunchne ka hidden tareeka:** footer ki **copyright line par 5 tap** → `/admin` (3 tap ke baad chhota hint), aur kisi bhi page par URL me **`#admin`**. `?admin=1` fee-structure page ka apna shortcut hai, isliye global handler us page par skip karta hai. Footer me koi visible admin link nahi — portal private hi rehta hai.
  - **Blog cover image upload complete** (backend 8mb limit + `coverImage` max 7M pehle se uncommitted tha): admin blog editor me mobile se photo **Upload** button — image browser me resize + JPEG compress hokar data URL (max width 1280, ~700KB cap), preview + remove button; URL wala option bhi bacha. `cover_image` column already `text` hai, migration nahi chahiye.
  - ✅ Verify: `npm run lint` (tsc) clean · `npm run build` successful · api-server esbuild bundle OK · dev server par `/admin` + `/admin/blog` 200 · local `/health` 200 aur `/api/chat` (bina `GROQ_API_KEY`) 503 par fallback path test kiya.

- **[2026-10-05]** 🔍 **SEO + performance pass (sara frontend)** — 17 public pages ka metadata, prerender aur bundle split:
  - **Per-route prerender (`artifacts/bvps-website/scripts/prerender-seo.mjs`):** build ke baad har public route ka apna `dist/<route>/index.html` shell banta hai jisme us page ka `<title>`, `meta description`, `robots`, `canonical`, poora `og:*`/`twitter:*` set + School JSON-LD + BreadcrumbList. Saath hi `dist/404.html` (noindex) aur `dist/sitemap.xml` (build-date `lastmod`) generate hota hai. Routes ki list **`src/lib/public-routes.json`** (path/label/priority/changefreq/title/description) — naya page add karna ho toh yahin add karo. `package.json` ka `build` ab `vite build && node scripts/prerender-seo.mjs` hai.
  - **`vercel.json`: catch-all rewrite hata diya** (`/(.*) → /index.html`). Ab sirf `/admin`, `/admin/:path*` aur `/blog/:slug` rewrite hote hain; baaki sab real static files hain. Isse **soft-404** khatam (adhoore URL ab 404 status paate hain) aur har page ka asli metadata crawler ko milta hai. Plus `cleanUrls`, `/assets/*` ko 1-saal immutable cache, images ko 7-day, robots/sitemap/manifest ko 1-hour cache headers.
  - **Central SEO module (`src/lib/seo.tsx`):** `SeoBase()` + `SchoolStructuredData()` RootLayout me mount hain → har page par `og:site_name`/`og:locale`/`og:image`(1200×630)/`twitter:card` guaranteed. Pehle har page apna Helmet block likhta tha jinme se zyadatar me `twitter:image`, `og:image:alt`, canonical missing the. Purana homepage JSON-LD (fake `sameAs` social links wala) hataya — ab `buildSchoolSchema()` use hota hai (address/geo/hours/contactPoint/taxID ke saath).
  - **New shared image assets (`public/`):** `og-bvps.jpg` (1200×630 real OG image — pehle `/assets/<hashed>.webp` tha jo exist hi nahi karta tha, isliye WhatsApp/Facebook preview blank aata tha), `school-logo.png` + `.webp` (`.jpg` delete), `favicon.svg` redesign (BVPS school building mark), `favicon-192/512.png`, `apple-touch-icon.png`, `manifest.webmanifest` (PWA).
  - **`index.html`:** `lang="en-IN"`, `maximum-scale=1` hataya (pinch-zoom WCAG 1.4.4), sahi geo coordinates (29.6807/76.2354 — pehle 29.9275 galat the), fonts **Outfit + Playfair Display** (pehle index.html me "Inter" load hota tha jo app me use hi nahi tha), aur `<noscript>` block jisme school ki poori jaankari + 13 page links hain (JS-na-chalane wale crawlers/AI fetchers ke liye).
  - **Performance — code splitting:** `App.tsx` me saare 19 pages ab `React.lazy()` + `<Suspense>` hain → har page apna alag chunk (pehle ek hi ~1MB+ bundle). `vite.config.ts` me `manualChunks` se react/helmet/framer-motion/lucide/query vendor chunks alag. Fonts ka CSS `index.css` se `@import` hata kar `index.html` ke `<link>`+`preconnect` me kiya (ek render-blocking round-trip kam).
  - **A11y + micro-fixes:** RootLayout me **skip-to-content link** + `<main id="main-content">`, `Navbar` me `aria-label="Main"`, `Footer` me `aria-label`, footer ka galat email `info@bvpskalayat.edu` → `.edu.in`, `robots.txt` me `/admin` + `/api/` Disallow aur `Google-Extended`/`CCBot` block (GPTBot/ClaudeBot allow rakhe), home page slider ke duplicate blur `<img>` render kam kiye, "Nursery to 12th" → "Classes 1 to 12" (school sirf 1–12 hai).
  - **06-Oct ko complete kiya:** `RootLayout.tsx:16` par ek syntax error bach gaya tha (`}, [location);` — `]` missing) jisse `npm run lint` fail ho raha tha; fix kiya. Ab `npm run lint` clean, `npm run build` (vite + prerender: 17 route shells + 404 + sitemap) OK, api-server esbuild bundle OK.

## To-Do Notes
- ⭐ **Chatbot ab "hamesha working":** Render API fail/lag par bhi website ka local knowledge base (`src/lib/school-kb.ts`) jawab de deta hai — user ko dead-end "unavailable" message nahi milta. Server theek ho jaye toh Groq wala reply aata hai. Offline reply me Retry + Call office buttons aate hain.
- ⚠️ **`GROQ_API_KEY`** — set ho chuka hai ✅ (chatbot live).
- ⚠️ **CallMeBot activation** — abhi zaroorat nahi (email primary channel hai); WhatsApp chahiye to activate karna hoga.
- ⚠️ **FormSubmit activation** — jaatlakshya496@gmail.com par FormSubmit ka "Activate Form" email aaya hai; uska link click karna baaki hai. Iske bina email nahi jayega (`emailSent: false` rahega).
- ⚠️ **naya Gmail app password** abhi bhi rotate karna hai (purana compromised tha; Render free par SMTP block hai isliye abhi zaroorat nahi, par rotate kar lo).
- ⚠️ Render API key (`rnd_fj9gv5IMZwG2RhiuCnS2w3pzBZuJ`) user ne chat mein share ki thi — kaam khatam hone ke baad revoke kar dena (Render → Account Settings → API Keys → Revoke).

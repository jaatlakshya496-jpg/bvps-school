# BVPS Website — SEO Action Plan

**Last verified:** 09 Nov 2026
**Site:** https://bvps-school.vercel.app
**Search Console property:** `https://bvps-school.vercel.app/` (URL prefix)

---

## 1. Screenshot ka matlab — pehle ye samajh lo

Screenshot me breadcrumb tha:

`Pa... > Discover > Validation details`

Ye **Google Discover** ka report hai, **Page Indexing** ka nahi. Dono alag systems hain:

| Report | Kya karta hai | Iska SEO se rishta |
|---|---|---|
| **Discover** | Google app/feed me dikhne wali stories | Chhote school sites yahan normally **kabhi nahi** aate |
| **Page Indexing** | Normal Google Search results | **Yahi asli report hai** jo matter karti hai |

Isliye "PENDING 16" ka matlab ye **nahi** hai ki website index nahi ho rahi. Discover ki validation hafte/mahine tak pending reh sakti hai — aur usse search ranking par koi asar nahi padta.

**Karo:** Search Console → left menu → **Indexing → Pages**. Wahan asli status dekho.

---

## 2. Timeline — kitne din hue

- Validation start: **27 Oct 2026**
- Aaj: **09 Nov 2026**
- Total: **13 din**

13 din SEO ke hisaab se kuch bhi nahi hai. Naye / low-authority sites ko Google Search me properly index hone me **2 se 6 mahine** lag sakte hain. "Top result" ka koi code se guarantee nahi hota.

---

## 3. Live site ka technical status (09 Nov 2026 ko check kiya)

| Check | Result | Note |
|---|---|---|
| 18 sitemap URLs | 200 OK | ✅ |
| `robots.txt` | 200, sahi rules | ✅ `/admin`, `/api` blocked |
| `<meta name="robots">` | `index, follow` | ✅ |
| Per-page title / description | unique | ✅ |
| canonical + og + twitter | per-page | ✅ |
| JSON-LD (School, Breadcrumb) | present | ✅ |
| **Static HTML content** | **pehle khaali `<div id="root">` tha** | ❌ **ab fix (neeche dekho)** |
| `/api/blog` | **503** | ❌ DB down |
| `/api/fees` | **503** (fallback chal raha hai) | ❌ DB down |
| `/api/content` | 200 (khaali) | ⚠️ DB down |
| `/health` (Vercel par) | 404 | ⚠️ Render par `/health` 200 hai |

---

## 4. Asli problem kya thi (root cause)

### 4.1 Har page ka HTML body identical tha

Pehle har URL ka HTML aisa tha:

```html
<body>
  <div id="root"></div>          <!-- khaali -->
  <noscript> ... same text har page par ... </noscript>
</body>
```

Matlab **18 pages ka body content bilkul same**, sirf `<head>` ka metadata alag. Google ko asli content dikhane ke liye JavaScript render karna padta hai. Low-authority site par ye render queue me chali jaati hai — isliye **"Last crawled: N/A"** aur **"Discovered - currently not indexed"**.

### 4.2 Database 17 Oct se suspended hai

Render ka free Postgres `bvps-db` expire ho gaya. Isliye:

- `/api/blog` → **503** → blog page par error
- `/api/fees` → **503** → fallback fees + warning
- `/api/content` → khaali (defaults use ho rahe hain)

Blog = **fresh content**. Fresh content na ho to Google ko site "zinda aur badalti hui" nahi lagti.

### 4.3 Backlinks almost zero

Google ko kisi site ke "important" hone ka sabse bada signal **doosri websites se aane wale links** hain. Abhi site lagbhag akeli khadi hai. Ye single biggest reason hai.

### 4.4 `*.vercel.app` subdomain

`bvps-school.vercel.app` shared hosting subdomain hai. Iski apni authority nahi hoti aur dekhne me "temporary" lagta hai. Custom domain (`bvpskalayat.edu.in` type) rank karne me kaafi behtar hota hai.

---

## 5. Code me kya fix kiya (09 Nov 2026)

### ✅ Har page ab build ke waqt **asli content** ke saath generate hota hai

- Naya file: `artifacts/bvps-website/src/lib/prerender-shells.json`
  - 18 routes ke liye asli H1, paragraphs, key details aur internal links (school ki verified jaankari).
- `scripts/prerender-seo.mjs` ab wo content inline styles ke saath `<div id="root">` ke andar daalta hai.
- `src/main.tsx` mount hone se pehle `container.replaceChildren()` chala kar shell hata deta hai — user ko sirf normal app dikhti hai.
- **Result:** Google ko pehli request par hi 1,000+ characters ka unique, relevant content mil jata hai. JS render ka intezaar nahi.

**Kyun safe hai:** Ye cloaking nahi hai. Ye content React mount hote hi hat jaata hai aur jo content dikhta hai wo site par sach me maujood jaankari hai (address, fees process, streams, facilities).

### ✅ Blog post pages ka poora content static HTML me

Ab har published post ka `dist/blog/<slug>/index.html` me title, excerpt **aur poora article text** hota hai. Blog API down ho ya crawler JS na chalaye — content phir bhi milega.

### ✅ Blog page API down hone par bhi content deta hai

Pehle `/blog` par sirf "Posts load nahi ho paye" dikhta tha. Ab uske saath Admissions / Fees / Contact ke cards + school ka intro text bhi aata hai.

### ✅ Blog post page se galat `noindex` hataya

Pehle API down hone par post page `noindex` bhej deta tha — matlab **jaan-boojh kar page ko index se gira dena**. Ab sirf genuinely missing post (404) par `noindex` lagta hai.

### ✅ Sitemap `lastmod` theek kiya

Pehle har build par **saari 18 URLs ka lastmod "aaj"** ho jata tha. Google aise lastmod ko ignore kar deta hai. Ab ek stable content-update date (`SITE_CONTENT_UPDATED`) use hoti hai, aur per-route `lastmod` bhi `public-routes.json` se diya ja sakta hai.

---

## 6. Ab tumhe kya karna hai — step by step

### Step 1 — Sahi report kholo (5 min)

1. https://search.google.com/search-console → apni property select karo.
2. **Indexing → Pages** kholo.
3. Dekho kaunsa issue hai:
   - **"Discovered – currently not indexed"** → Google ko pata hai par crawl nahi kiya. Neeche Step 3–5 karo.
   - **"Crawled – currently not indexed"** → crawl hua par content thin/duplicate laga. Content badhao (Step 6).
   - **"Excluded by noindex"** → kisi page par galti se noindex hai. Batao, main fix kar dunga.

### Step 2 — Sitemap dobara submit karo (2 min)

1. **Indexing → Sitemaps**
2. `sitemap.xml` likho → **Submit**
3. Status "Success" dikhna chahiye. 18 URLs list honge.

### Step 3 — Important pages ko manually index karwao (10 min, roz 10 tak)

**URL Inspection** box me ek-ek URL daalo → **Request Indexing**:

1. `https://bvps-school.vercel.app/`
2. `/admissions`
3. `/fee-structure`
4. `/about`
5. `/contact`
6. `/academics`
7. `/streams`
8. `/facilities`
9. `/gallery`
10. `/results`

Baaki pages baad me. Ye quota **~10 URLs/day** hai.

### Step 4 — Google Business Profile banao (sabse zyada asar, 30 min)

School ke liye local search me yahi #1 cheez hai.

1. https://business.google.com → **Add business**
2. Naam: **Bal Vikas Public School** (bilkul isi spelling se)
3. Category: **School** (secondary: "Co-ed school")
4. Address: **Railway Road, Kalayat, Kaithal, Haryana 136117**
5. Phone: **+91 98125 50200**
6. Website: `https://bvps-school.vercel.app`
7. Hours: Mon–Sat 8:00 AM – 3:00 PM
8. **Verification** complete karo (postcard / phone / video — jo option mile)
9. Verification ke baad: **10–15 asli photos** upload karo (campus, classrooms, playground, events), aur 3–5 **posts** daalo (admissions open, results, etc.)
10. Parents se **Google reviews** maango — WhatsApp par direct review link bhejo. 10+ reviews se local ranking turant improve hoti hai.

### Step 5 — Backlinks banao (har hafte 2–3)

Real, relevant links. Kharidne ki zaroorat nahi.

- [ ] Facebook page banao → website link daalo
- [ ] Instagram / YouTube channel → bio me link
- [ ] JustDial par school listing (free)
- [ ] Sulekha par listing
- [ ] Haryana school directory sites par listing
- [ ] Local news (Kalayat/Kaithal) ko school event ki photo bhejo — wo link denge
- [ ] WhatsApp par parents ko website link bhejo (DM links count nahi hote, par traffic aata hai)
- [ ] Nearby coaching centres / shops se "partners" page par link
- [ ] Alumni Facebook groups me school website mention
- [ ] Google Business Profile ka website field (ye bhi ek strong link hai)

**Target:** 3 mahine me 15–20 real links.

### Step 6 — Content regularly daalo (har hafte 1 post)

Blog abhi API down hone ki wajah se khaali hai. DB restore hone ke baad admin portal se hafte me 1 post daalo. Ideas:

1. "Admissions 2026-27 open — documents and process"
2. "HBSE Class 10 & 12 result 2026 — BVPS students ka performance"
3. "Annual function 2026 highlights"
4. "Sports day: football, kabaddi, athletics winners"
5. "Smart classrooms: how BVPS teaches with technology"
6. "Stream selection guide: Medical vs Non-Medical vs Commerce vs Arts"
7. "School timing and transport information"
8. "Independence Day / Republic Day celebration photos"
9. "Parent-teacher meeting: what to expect"
10. "Why Hindi-medium education works in Kalayat"

Har post **minimum 400–600 words**, asli photos ke saath. Copy-paste mat karo — unique likho.

### Step 7 — Custom domain (agar possible ho)

`bvpskalayat.edu.in` ya `bvpskalayat.com` lo (~₹800–1200/saal) aur Vercel par point karo. Phir Search Console me nayi property add karke 301 redirects set karo. Ye long-term me sabse bada fayda dega.

---

## 7. Blocker jo user ke bina solve nahi ho sakta

### 🔴 Render Postgres restore karo

`bvps-db` (free Postgres) **17 Oct 2026** ko expire ho gaya. Isliye:

- blog khaali hai
- fees fallback par hain
- admin messages save nahi ho rahe

**Karo:**
1. https://dashboard.render.com → **bvps-db** kholo
2. **Support** se poochho ki expired DB ka koi backup/export recover ho sakta hai ya nahi
3. Agar recover na ho → naya Postgres banao → `DATABASE_URL` update karo → migrations apne aap chalengi (startup par `migrate()`)
4. Naye DB me admin se 2–3 blog posts daalo

**Purane DB ko delete mat karo** jab tak Render Support confirm na kare.

### 🔴 FormSubmit activation

`jaatlakshya496@gmail.com` par FormSubmit ka activation email aaya tha. Inbox + Spam dono check karke link click karo. Warna contact form ki email nahi jaati (DB me save hoti hai, par email nahi).

### 🔴 CallMeBot (WhatsApp alerts)

`CALLMEBOT_APIKEY` Render par set nahi hai. Steps:
1. CallMeBot ka latest WhatsApp number lo (unke page se)
2. Us number par WhatsApp karo: `I allow callmebot to send me messages`
3. Reply me API key aayegi
4. Render → `bvps-api` → Environment → `CALLMEBOT_APIKEY` add → Deploy

---

## 8. Weekly checklist (copy-paste kar lo)

Har hafte:

- [ ] Search Console → **Pages** report me numbers compare karo
- [ ] Naye "Excluded" pages ka reason dekho
- [ ] 1 blog post publish karo (DB restore ke baad)
- [ ] Google Business Profile par 1 post + 2 photos
- [ ] 2 naye backlinks try karo
- [ ] 1–2 parents se Google review maango
- [ ] URL Inspection se 2–3 pages **Request Indexing** karo

Har mahine:

- [ ] Sitemap re-submit
- [ ] Core Web Vitals check
- [ ] Kitne pages index hue — count note karo
- [ ] Top queries dekh kar content plan adjust karo

---

## 9. Realistic expectation

| Time | Kya expect karein |
|---|---|
| 0–2 hafte | Kuch nahi. Google crawl schedule karta hai. |
| 2–6 hafte | Homepage + 3–5 main pages index honge |
| 2–3 mahine | 10–15 pages index, brand name "Bal Vikas Public School Kalayat" par ranking |
| 3–6 mahine | "school in Kalayat", "HBSE school Kaithal" jaise local queries par visibility |
| 6–12 mahine | Backlinks + reviews + regular content ke saath competitive local ranking possible |

**Sabse bada lever:** Google Business Profile + reviews + backlinks. Technical side ab theek hai.

---

## 10. Reference — kya-kya code me hai

| File | Kaam |
|---|---|
| `src/lib/public-routes.json` | 18 public routes ka title/description/priority/changefreq |
| `src/lib/prerender-shells.json` | Har route ka crawlable static content |
| `scripts/prerender-seo.mjs` | Per-route HTML shells + sitemap + 404 + blog post shells |
| `src/lib/seo.tsx` | `PageSeo` — runtime meta (helmet) |
| `src/main.tsx` | Shell clear + React mount |
| `public/robots.txt` | Crawl rules + sitemap |
| `vercel.json` | Rewrites, cache headers, security headers |

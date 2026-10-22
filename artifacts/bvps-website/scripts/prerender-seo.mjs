/**
 * Post-build SEO step.
 *
 * Ye site ek Vite SPA hai, isliye pehle har URL par Vercel ka catch-all
 * rewrite `dist/index.html` (homepage ka head) serve karta tha. Do bade nuksan:
 *
 *   1. Googlebot ke alawa koi bhi consumer (Bing, AI/answer-engine fetchers,
 *      preview bots) har page par homepage ka `<title>`/`<description>` hi
 *      dekhta tha — 17 pages, ek hi metadata.
 *   2. Adh-jhuk URL par bhi HTTP 200 return hota tha, isliye Google unhe
 *      "soft 404" maankar index me daalta tha.
 *
 * Is script ka kaam: Vite ke build ke baad har public route ka ek static
 * `dist/<route>/index.html` shell likhna, jisme us page ka apna
 * title/description/canonical/og/twitter + School JSON-LD pehle se ho.
 * Vercel static files ko rewrite se pehle serve karta hai, isliye har route
 * ab real file ban jata hai, aur catch-all rewrite hataane se adhoora URL ko
 * proper 404 status milta hai (Vercel `dist/404.html` serve karta hai).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE = path.resolve(__dirname, "..");
const DIST = path.resolve(WEBSITE, "../../dist");

const SITE_URL = "https://bvps-school.vercel.app";
const SITE_NAME = "Bal Vikas Public School, Kalayat";
const OG_IMAGE = `${SITE_URL}/og-bvps.jpg`;
const LOGO_URL = `${SITE_URL}/school-logo.png`;
const OG_IMAGE_ALT =
  "Bal Vikas Public School campus, Railway Road, Kalayat, District Kaithal, Haryana";

const routes = JSON.parse(
  fs.readFileSync(path.join(WEBSITE, "src/lib/public-routes.json"), "utf8"),
);

// ---- Blog posts (dynamic sitemap + prerendered shells) ---------------------
// Pehle sitemap sirf static routes se banta tha, isliye admin portal se publish
// hone wale blog posts Google ko kabhi nahi milte the. Ab build ke waqt public
// API se published posts fetch hote hain:
//   • har post ka `/blog/<slug>` URL sitemap me add hota hai (uski asli date ke
//     saath), aur
//   • har post ka apna `dist/blog/<slug>/index.html` shell banta hai jisme us
//     post ka title/description/og:image + BlogPosting JSON-LD pehle se hota hai.
//
// API base `VITE_API_BASE_URL` se aata hai. Vite ise build ke liye .env se
// uthata hai, par ye script alag node process hai — isliye .env files khud
// padhte hain. Fetch fail ho (Render cold start / down) toh build fail nahi
// hota; bas static routes wala sitemap ban jaata hai.
function readDotEnv(file, key) {
  try {
    if (!fs.existsSync(file)) return "";
    const match = fs
      .readFileSync(file, "utf8")
      .match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`, "m"));
    return match ? match[1].replace(/^["']|["']$/g, "").trim() : "";
  } catch {
    return "";
  }
}

function readEnvValue(key) {
  const candidates = [
    process.env[key],
    readDotEnv(path.join(WEBSITE, ".env.production"), key),
    readDotEnv(path.join(WEBSITE, ".env.local"), key),
    readDotEnv(path.join(WEBSITE, ".env"), key),
  ];
  return candidates.find((v) => typeof v === "string" && v.trim())?.trim() ?? "";
}

const API_BASE = (
  readEnvValue("VITE_API_BASE_URL") || "https://bvps-school-1.onrender.com"
).replace(/\/+$/, "");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function fetchPublishedPosts() {
  if (typeof fetch !== "function") {
    console.warn("[prerender] fetch available nahi hai — blog posts skip");
    return [];
  }

  const url = `${API_BASE}/api/blog`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      const posts = rows.filter(
        (p) => p && p.status === "published" && SLUG_PATTERN.test(String(p.slug ?? "")),
      );
      console.log(`[prerender] ${posts.length} published blog post(s) mile (${API_BASE})`);
      return posts;
    } catch (err) {
      console.warn(
        `[prerender] blog fetch attempt ${attempt} fail (${err?.message ?? err})`,
      );
      if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.warn(`[prerender] blog API reachable nahi (${API_BASE}) — sirf static routes sitemap me`);
  return [];
}

const SCHOOL = {
  name: "Bal Vikas Public School",
  shortName: "BVPS",
  telephone: "+919812550200",
  telephoneAlt: "+919812550202",
  emailAdmissions: "admissions@bvpskalayat.edu.in",
  emailGeneral: "info@bvpskalayat.edu.in",
  streetAddress: "Railway Road",
  addressLocality: "Kalayat",
  addressRegion: "Haryana",
  postalCode: "136117",
  addressCountry: "IN",
  latitude: 29.6807,
  longitude: 76.2354,
  foundingDate: "2004",
  board: "Haryana Board of School Education (BSEH)",
  principal: "Sh. Ramphal Sharma",
  grades: "Classes 1 to 12",
};

const schoolSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["School", "EducationalOrganization", "LocalBusiness"],
      "@id": `${SITE_URL}/#school`,
      name: SCHOOL.name,
      alternateName: SCHOOL.shortName,
      url: SITE_URL,
      logo: LOGO_URL,
      image: [OG_IMAGE],
      description: `${SCHOOL.name} is a co-educational school in Kalayat, District Kaithal, Haryana, affiliated to ${SCHOOL.board}, offering ${SCHOOL.grades} since ${SCHOOL.foundingDate}.`,
      foundingDate: SCHOOL.foundingDate,
      email: SCHOOL.emailGeneral,
      telephone: SCHOOL.telephone,
      address: {
        "@type": "PostalAddress",
        streetAddress: SCHOOL.streetAddress,
        addressLocality: SCHOOL.addressLocality,
        addressRegion: SCHOOL.addressRegion,
        postalCode: SCHOOL.postalCode,
        addressCountry: SCHOOL.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SCHOOL.latitude,
        longitude: SCHOOL.longitude,
      },
      areaServed: [
        { "@type": "City", name: "Kalayat" },
        { "@type": "AdministrativeArea", name: "Kaithal District, Haryana" },
      ],
      employee: { "@type": "Person", name: SCHOOL.principal, jobTitle: "Principal & Founder" },
      founder: { "@type": "Person", name: SCHOOL.principal },
      numberOfEmployees: { "@type": "QuantitativeValue", value: 29 },
      numberOfStudents: { "@type": "QuantitativeValue", value: 945 },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "15:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Sunday",
          opens: "00:00",
          closes: "00:00",
        },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "admissions",
          telephone: SCHOOL.telephone,
          email: SCHOOL.emailAdmissions,
          areaServed: "IN",
          availableLanguage: ["en", "hi", "pa"],
        },
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: SCHOOL.telephoneAlt,
          email: SCHOOL.emailGeneral,
          areaServed: "IN",
          availableLanguage: ["en", "hi", "pa"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#school` },
    },
  ],
};

function breadcrumbSchema(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const indexHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
if (!indexHtml.includes("<head>")) {
  console.error("[prerender] dist/index.html me <head> nahi mila — build check karo");
  process.exit(1);
}

/** Head block ke andar ek meta/link tag ko replace ya insert karta hai. */
function upsertTag(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function pageHead({ title, description, canonical, robots, schema }) {
  const url = `${SITE_URL}${canonical}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:image:alt" content="${esc(OG_IMAGE_ALT)}" />`,
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
  ].join("\n    ");
}

function renderPage({
  title,
  description,
  canonical,
  robots,
  schema,
  image = OG_IMAGE,
  ogType = "website",
}) {
  let html = indexHtml;

  html = upsertTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = upsertTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${esc(description)}" />`,
  );
  html = upsertTag(html, /<meta\s+name="robots"[\s\S]*?\/>/, `<meta name="robots" content="${robots}" />`);
  html = upsertTag(html, /<link\s+rel="canonical"[\s\S]*?>/, `<link rel="canonical" href="${SITE_URL}${canonical}" />`);
  // NOTE: `google-site-verification` yahan se kabhi na likho — `index.html` mein
  // jo asli Search Console code hai wahi har shell me inherit hona chahiye.
  // (Pehle yahan hardcoded "xxxxxxxxxxxx" placeholder tha jo har build par asli
  // code ko overwrite kar deta tha, isliye Search Console verify hi nahi hota tha.)

  html = upsertTag(html, /<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = upsertTag(html, /<meta\s+property="og:type"[\s\S]*?\/>/, `<meta property="og:type" content="${esc(ogType)}" />`);
  html = upsertTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = upsertTag(html, /<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${SITE_URL}${canonical}" />`);
  html = upsertTag(html, /<meta\s+property="og:image"[\s\S]*?\/>/, `<meta property="og:image" content="${esc(image)}" />`);

  html = upsertTag(html, /<meta\s+name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = upsertTag(html, /<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = upsertTag(html, /<meta\s+name="twitter:image"[\s\S]*?\/>/, `<meta name="twitter:image" content="${esc(image)}" />`);

  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );
  html = html.replace(
    "</head>",
    `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`,
  );

  return html;
}

let written = 0;
const today = new Date().toISOString().slice(0, 10);

for (const route of routes) {
  const html = renderPage({
    title: route.title,
    description: route.description,
    canonical: route.path,
    robots: "index, follow, max-image-preview:large, max-snippet:-1",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        ...schoolSchema["@graph"],
        breadcrumbSchema([{ label: "Home", path: "/" }, { label: route.label, path: route.path }]),
      ],
    },
  });

  const dir = route.path === "/" ? DIST : path.join(DIST, route.path.replace(/^\/|\/$/g, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  written++;
}

// ---- blog posts ------------------------------------------------------------
// Har published post ka apna static shell + sitemap entry (dekho upar wala
// `fetchPublishedPosts` comment). Slug valid nahi hai toh us post ko skip karte
// hain — warna path traversal / broken canonical URL ban sakta hai.
const posts = await fetchPublishedPosts();
let blogWritten = 0;

for (const post of posts) {
  const slug = String(post.slug).trim();
  const canonical = `/blog/${slug}`;
  const postUrl = `${SITE_URL}${canonical}`;

  const description =
    String(post.excerpt ?? "").replace(/\s+/g, " ").trim() ||
    `${post.title} — news and updates from Bal Vikas Public School, Kalayat.`;
  // coverImage upload se data URL (base64) bhi ho sakta hai — og:image me sirf
  // real HTTP URL chalta hai, isliye warna default OG image use hoti hai.
  const image = /^https?:\/\//i.test(String(post.coverImage ?? ""))
    ? String(post.coverImage)
    : OG_IMAGE;

  const published = post.publishedAt ? new Date(post.publishedAt) : null;
  const updated = post.updatedAt ? new Date(post.updatedAt) : published;
  const datePublished =
    published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined;
  const dateModified =
    updated && !Number.isNaN(updated.getTime()) ? updated.toISOString() : datePublished;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      ...schoolSchema["@graph"],
      {
        "@type": "BlogPosting",
        headline: post.title,
        description,
        url: postUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
        image: [image],
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
        inLanguage: "en-IN",
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: { "@type": "ImageObject", url: LOGO_URL },
        },
      },
      breadcrumbSchema([
        { label: "Home", path: "/" },
        { label: "Blog", path: "/blog" },
        { label: post.title, path: canonical },
      ]),
    ],
  };

  const html = renderPage({
    title: `${post.title} — BVPS Blog`,
    description,
    canonical,
    robots: "index, follow, max-image-preview:large, max-snippet:-1",
    schema,
    image,
    ogType: "article",
  });

  const dir = path.join(DIST, "blog", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  blogWritten++;
}

// ---- 404 ------------------------------------------------------------------
// Vercel static output me `404.html` ko real 404 status ke saath serve karta
// hai. Isse adhoore URL Google ke "soft 404" log me ghusne se bach jate hain.
fs.writeFileSync(
  path.join(DIST, "404.html"),
  renderPage({
    title: "Page Not Found — Bal Vikas Public School Kalayat",
    description:
      "The page you were looking for is not available. Explore Bal Vikas Public School Kalayat — admissions, fee structure, academics, gallery and contact details.",
    canonical: "/",
    robots: "noindex, follow",
    schema: { "@context": "https://schema.org", "@graph": schoolSchema["@graph"] },
  }),
  "utf8",
);

// ---- sitemap --------------------------------------------------------------
const sitemapEntries = [
  ...routes.map((r) => ({
    loc: `${SITE_URL}${r.path === "/" ? "/" : r.path}`,
    lastmod: today,
    changefreq: r.changefreq,
    priority: r.priority,
  })),
  ...posts.map((post) => {
    const stamp = post.updatedAt || post.publishedAt;
    const date = stamp ? new Date(stamp) : null;
    return {
      loc: `${SITE_URL}/blog/${String(post.slug).trim()}`,
      lastmod: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : today,
      changefreq: "monthly",
      priority: "0.6",
    };
  }),
];

const urls = sitemapEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n");

fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- Build time par generate hota hai (scripts/prerender-seo.mjs).
     Static pages ki list: src/lib/public-routes.json
     Blog posts build ke waqt API se aate hain (published posts only). -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  "utf8",
);

// public/ me bhi rakho taaki dev server par bhi sahi sitemap mile
fs.mkdirSync(path.join(WEBSITE, "public"), { recursive: true });
fs.copyFileSync(path.join(DIST, "sitemap.xml"), path.join(WEBSITE, "public/sitemap.xml"));

console.log(
  `[prerender] ${written} static shell(s) + ${blogWritten} blog shell(s) + 404.html + sitemap.xml (${sitemapEntries.length} URLs) likhe`,
);

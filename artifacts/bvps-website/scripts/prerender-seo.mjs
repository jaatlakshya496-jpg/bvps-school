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

function renderPage({ title, description, canonical, robots, schema }) {
  let html = indexHtml;

  html = upsertTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = upsertTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${esc(description)}" />`,
  );
  html = upsertTag(html, /<meta\s+name="robots"[\s\S]*?\/>/, `<meta name="robots" content="${robots}" />`);
  html = upsertTag(html, /<link\s+rel="canonical"[\s\S]*?>/, `<link rel="canonical" href="${SITE_URL}${canonical}" />`);

  html = upsertTag(html, /<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = upsertTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(description)}" />`);
  html = upsertTag(html, /<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${SITE_URL}${canonical}" />`);
  html = upsertTag(html, /<meta\s+property="og:image"[\s\S]*?\/>/, `<meta property="og:image" content="${OG_IMAGE}" />`);

  html = upsertTag(html, /<meta\s+name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = upsertTag(html, /<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = upsertTag(html, /<meta\s+name="twitter:image"[\s\S]*?\/>/, `<meta name="twitter:image" content="${OG_IMAGE}" />`);

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
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path === "/" ? "/" : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join("\n");

fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- Build time par generate hota hai (scripts/prerender-seo.mjs) — isliye
     har <lastmod> asli build date hai. Naye page add karne ke liye
     src/lib/public-routes.json update karo. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  "utf8",
);

// public/ me bhi rakho taaki dev server par bhi sahi sitemap mile
fs.mkdirSync(path.join(WEBSITE, "public"), { recursive: true });
fs.copyFileSync(path.join(DIST, "sitemap.xml"), path.join(WEBSITE, "public/sitemap.xml"));

console.log(`[prerender] ${written} route shell(s) + 404.html + sitemap.xml likhe (lastmod ${today})`);

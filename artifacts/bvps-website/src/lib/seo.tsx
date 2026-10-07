import { Helmet } from 'react-helmet-async';
import publicRoutes from './public-routes.json';
import { useSiteContent } from '@/lib/site-content';

/**
 * Central SEO module.
 *
 * Pehle har page apna `<Helmet>` block khud likhta tha, aur unme se zyadatar me
 * `twitter:image`, `og:image:alt`, `og:site_name` aur canonical tag missing the.
 * Isliye koi bhi page jo link share hota (WhatsApp/Facebook) wo ya to blank
 * preview dikhata tha ya homepage ka description.
 *
 * Ab ye module RootLayout me mount hota hai aur react-helmet-async ke merge
 * rule ki wajah se page ka apna `og:title`/`og:description`/`og:image`
 * override kar deta hai — baaki tags yahin se default mil jaate hain.
 */

export const SITE_URL = 'https://bvps-school.vercel.app';
export const SITE_NAME = 'Bal Vikas Public School, Kalayat';
export const SCHOOL_SHORT_NAME = 'BVPS';

// public folder me build-time par generate ki gayi real 1200x630 JPEG.
// (Pehle `/assets/<name>.webp` hardcoded tha jo Vite hash ke bina exist hi
// nahi karta tha — Vercel ka SPA rewrite us 404 ko 200 HTML bana deta tha,
// isliye social preview card kabhi render hi nahi hota tha.)
export const OG_IMAGE = `${SITE_URL}/og-bvps.jpg`;
export const OG_IMAGE_ALT =
  'Bal Vikas Public School, Railway Road, Kalayat, District Kaithal, Haryana';
export const LOGO_URL = `${SITE_URL}/school-logo.png`;

export const SCHOOL = {
  name: 'Bal Vikas Public School',
  shortName: 'BVPS',
  url: SITE_URL,
  telephone: '+919812550200',
  telephoneDisplay: '+91 98125 50200',
  telephoneAlt: '+919812550202',
  telephoneAltDisplay: '+91 98125 50202',
  emailAdmissions: 'admissions@bvpskalayat.edu.in',
  emailGeneral: 'info@bvpskalayat.edu.in',
  streetAddress: 'Railway Road',
  addressLocality: 'Kalayat',
  addressRegion: 'Haryana',
  postalCode: '136117',
  addressCountry: 'IN',
  district: 'Kaithal',
  // Map embed ka exact centre (contact.tsx ka Google Maps embed).
  latitude: 29.6807,
  longitude: 76.2354,
  foundingDate: '2004',
  schoolCode: '06050300920',
  board: 'Haryana Board of School Education (BSEH)',
  principal: 'Sh. Ramphal Sharma',
  principalRole: 'Principal & Founder',
  grades: 'Classes 1 to 12',
} as const;

/** Site ke saare public pages — sitemap, prerender aur breadcrumb data ke liye. */
export interface PublicRoute {
  path: string;
  label: string;
  priority: string;
  changefreq: string;
  title: string;
  description: string;
}

export const PUBLIC_ROUTES: PublicRoute[] = publicRoutes;

/**
 * Google rich results ke liye `School` schema.
 * Pehle sirf homepage par `EducationalOrganization` tha, wo bhi bina `url`,
 * `geo`, `image`, `openingHours` ke — aur usme 3 fake `sameAs` social links
 * the jo site par kahin link nahi the (spam signal).
 */
export function buildSchoolSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['School', 'EducationalOrganization', 'LocalBusiness'],
        '@id': `${SITE_URL}/#school`,
        name: SCHOOL.name,
        alternateName: SCHOOL.shortName,
        url: SITE_URL,
        logo: LOGO_URL,
        image: [OG_IMAGE],
        description: `${SCHOOL.name} is a co-educational school in Kalayat, District Kaithal, Haryana, affiliated to ${SCHOOL.board}, offering ${SCHOOL.grades} since ${SCHOOL.foundingDate}.`,
        foundingDate: SCHOOL.foundingDate,
        email: SCHOOL.emailGeneral,
        telephone: SCHOOL.telephone,
        taxID: SCHOOL.schoolCode,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SCHOOL.streetAddress,
          addressLocality: SCHOOL.addressLocality,
          addressRegion: SCHOOL.addressRegion,
          postalCode: SCHOOL.postalCode,
          addressCountry: SCHOOL.addressCountry,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SCHOOL.latitude,
          longitude: SCHOOL.longitude,
        },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${SCHOOL.latitude},${SCHOOL.longitude}`,
        areaServed: [
          { '@type': 'City', name: 'Kalayat' },
          { '@type': 'AdministrativeArea', name: 'Kaithal District, Haryana' },
        ],
        employee: { '@type': 'Person', name: SCHOOL.principal, jobTitle: SCHOOL.principalRole },
        founder: { '@type': 'Person', name: SCHOOL.principal },
        numberOfEmployees: { '@type': 'QuantitativeValue', value: 29 },
        numberOfStudents: { '@type': 'QuantitativeValue', value: 945 },
        educationalCredentialAwarded: 'Haryana Board of School Education (BSEH), Class 12',
        alumniOf: 'Class 1 to 12 (Haryana Board)',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ],
            opens: '08:00',
            closes: '15:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '00:00',
            closes: '00:00',
          },
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'admissions',
            telephone: SCHOOL.telephone,
            email: SCHOOL.emailAdmissions,
            areaServed: 'IN',
            availableLanguage: ['en', 'hi', 'pa'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: SCHOOL.telephoneAlt,
            email: SCHOOL.emailGeneral,
            areaServed: 'IN',
            availableLanguage: ['en', 'hi', 'pa'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: 'en-IN',
        publisher: { '@id': `${SITE_URL}/#school` },
      },
    ],
  };
}

export function buildBreadcrumbSchema(trail: { label: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Site-wide fallback head tags. RootLayout me mount hota hai, isliye har page
 * par `twitter:*` aur `og:site_name` guaranteed rahenge — chahe page ka apna
 * Helmet block kitna bhi minimal ho.
 */
export function SeoBase() {
  return (
    <Helmet>
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SITE_NAME} />
      <meta
        name="twitter:description"
        content={`${SCHOOL.name}, Kalayat — quality education for ${SCHOOL.grades}, affiliated to ${SCHOOL.board}. Admissions open.`}
      />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
      <meta name="author" content={SCHOOL.name} />
    </Helmet>
  );
}

export function SchoolStructuredData() {
  return (
    <script type="application/ld+json">{JSON.stringify(buildSchoolSchema())}</script>
  );
}

/**
 * Har public page ka poora SEO block — title, description, canonical aur
 * complete `og:*` / `twitter:*` set.
 *
 * Pehle ye tags har page apne `<Helmet>` me likhta tha jisme se zyadatar me
 * `og:url`, `canonical`, `og:image:alt`, `twitter:image` missing the, aur kuch
 * pages purana "2025-26" session dikha rahe the. Ab ek hi jagah se sab pages
 * milte hain, aur admin portal → School Information/SEO se title-description
 * edit kiya ja sakta hai (site_content override).
 *
 * `path` public-routes.json me na mile toh null (jaise /blog/:slug ya 404) —
 * wo page apna dynamic Helmet khud likhta hai.
 */
export function PageSeo({ path }: { path: string }) {
  const { get } = useSiteContent();
  const route = PUBLIC_ROUTES.find((r) => r.path === path);
  if (!route) return null;

  const slug = path === '/' ? 'home' : path.replace(/^\//, '');
  const title = get(`seo.${slug}.title`, route.title);
  const description = get(`seo.${slug}.description`, route.description);
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <link rel="canonical" href={url} />

      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
    </Helmet>
  );
}

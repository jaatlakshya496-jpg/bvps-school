import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import publicRoutes from '@/lib/public-routes.json';

/**
 * Website content — admin portal se edit hone wali saari text.
 *
 * Har field ka ek **default** yahan rehta hai (jo website me pehle hardcoded
 * tha). Admin koi bhi value save kare toh wo `site_content` table me override
 * ban jaati hai; hata de toh default wapas lag jaata hai. API fail/DNS down
 * ho toh bhi site defaults par chalti hai — kabhi blank nahi hota.
 *
 * Admin UI (`pages/admin/views/AdminSite.tsx`) isi schema se generate hota hai,
 * isliye naya field add karna ho toh sirf yahan add karo — form apne aap ban
 * jaayega.
 */

export type ContentFieldType = 'text' | 'textarea' | 'tel' | 'email' | 'url';

export interface ContentField {
  /** Poori key, jaise `site.phone1` ya `seo.about.title` */
  key: string;
  label: string;
  type?: ContentFieldType;
  hint?: string;
}

export interface ContentGroup {
  title: string;
  fields: ContentField[];
}

export interface ContentSection {
  id: string;
  title: string;
  description: string;
  groups: ContentGroup[];
}

const SITE_DEFAULTS: Record<string, string> = {
  // Global / site-wide
  'site.announcement':
    '',
  'site.name': 'Bal Vikas Public School',
  'site.tagline': 'Bal Vikas Public School, Kalayat',
  'site.phone1': '+91 98125 50200',
  'site.phone2': '+91 98125 50202',
  'site.emailAdmissions': 'admissions@bvpskalayat.edu.in',
  'site.emailGeneral': 'info@bvpskalayat.edu.in',
  'site.address': 'Railway Road, Kalayat, District Kaithal, Haryana – 136117',
  'site.whatsappNumber': '919812550200',
  'site.principal': 'Sh. Ramphal Sharma',
  'site.established': '2004',
  'site.schoolCode': '06050300920',
  'site.hoursWeek': 'Monday – Saturday: 8:00 AM – 3:00 PM',
  'site.hoursSunday': 'Sunday: Closed',
  // Home hero
  'home.hero.badge': 'Kalayat, Kaithal',
  'home.hero.lead': 'Welcome to',
  'home.hero.name': 'Bal Vikas Public School',
  'home.hero.tagline': 'Empowering Young Minds, Building Bright Futures.',
  'home.hero.intro':
    'Bal Vikas Public School mein hum students ko quality education ke saath discipline, confidence aur strong moral values dene par focus karte hain. Hamara goal hai ki har student apni knowledge aur talent ko develop karke future ke liye ready ho.',

  // Page heroes (title + one-line subtitle under the heading)
  'about.hero.title': 'About Bal Vikas Public School Kalayat',
  'about.hero.subtitle': 'Nurturing minds and shaping futures in Kalayat since 2004.',

  'academics.hero.title': 'Academics - Bal Vikas Public School Kalayat',
  'academics.hero.subtitle':
    'A structured, well-rounded curriculum designed to nurture every student from Class 1 to 12.',

  'admissions.hero.title': 'Admissions 2026-27',
  'admissions.hero.subtitle': 'Join the BVPS family. Admissions open for Classes 1 to 12.',

  'application.hero.title': 'Application Submission',
  'application.hero.subtitle':
    'Fill this form to register your admission enquiry for session 2026-27.',

  'blog.hero.title': 'BVPS Blog & News',
  'blog.hero.subtitle': 'School ki taaza khabarein, events aur updates - ek jagah par.',

  'contact.hero.title': 'Contact Bal Vikas Public School Kalayat',
  'contact.hero.subtitle':
    "We're here to help. Reach out to us for admissions, queries, or just to say hello.",

  'enrollment.hero.title': 'Enrollment',
  'enrollment.hero.subtitle': 'Final step - complete formalities and officially join the BVPS family.',

  'facilities.hero.title': 'Our Facilities',
  'facilities.hero.subtitle':
    'Modern amenities blending with traditional values to create the perfect learning environment in Kalayat.',

  'fee.hero.title': 'Fee Structure',
  'fee.hero.subtitle': 'Complete, transparent fee details for Class 1 to 12 - Session 2026-27.',

  'feedback.hero.title': 'Share Your Feedback',
  'feedback.hero.subtitle':
    'Your thoughts help us grow. We value feedback from parents, students, and visitors.',

  'gallery.hero.title': 'School Moments',
  'gallery.hero.name': 'at Bal Vikas Public School',
  'gallery.hero.subtitle':
    'Explore the people, places and celebrations that make Bal Vikas Public School a special part of Kalayat.',

  'interview.hero.title': 'Interview & Interaction',
  'interview.hero.subtitle': 'A brief, friendly interaction with the student and parents - not a test.',

  'results.hero.lead': 'Our',
  'results.hero.name': 'Achievers',
  'results.hero.subtitle':
    'Celebrating every champion of Bal Vikas Public School — Football, Cricket, Karate & Athletics.',

  'timing.hero.title': 'School Timings',
  'timing.hero.subtitle': 'Office hours, school schedule, and visit guidelines.',

  'streams.hero.title': 'Streams & Curriculum',
  'streams.hero.subtitle':
    'Subject breakdown for every class - Primary, Middle, Secondary, and Senior Secondary.',
};

/** `seo.<slug>.title` / `.description` — 17 public pages ke liye. */
function buildSeoDefaults(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const route of publicRoutes) {
    const slug = route.path === '/' ? 'home' : route.path.replace(/^\//, '');
    out[`seo.${slug}.title`] = route.title;
    out[`seo.${slug}.description`] = route.description;
  }
  return out;
}

export const DEFAULT_CONTENT: Record<string, string> = {
  ...SITE_DEFAULTS,
  ...buildSeoDefaults(),
};

function f(key: string, label: string, type: ContentFieldType = 'text', hint?: string): ContentField {
  return { key, label, type, hint };
}

function heroGroup(slug: string, title: string, subtitle = true): ContentGroup {
  const fields = [f(`${slug}.hero.title`, `${title} — Heading (H1)`)];
  if (subtitle) fields.push(f(`${slug}.hero.subtitle`, `${title} — One line under heading`, 'textarea'));
  return { title, fields };
}

export const CONTENT_SECTIONS: ContentSection[] = [
  {
    id: 'site',
    title: 'School Information',
    description:
      'Ye details poori website par (footer, contact page, WhatsApp button) use hoti hain. Yahan badlo, sab jagah badal jaayega.',
    groups: [
      {
        title: 'Important notice (optional)',
        fields: [
          f(
            'site.announcement',
            'Site-wide notice bar (empty = hidden)',
            'textarea',
            'Jaise: "Admissions 2026-27 open — last date 31 March". Website ke top par dikhega.',
          ),
        ],
      },
      {
        title: 'Basic details',
        fields: [
          f('site.name', 'School name'),
          f('site.tagline', 'Tagline / short name'),
          f('site.principal', 'Principal name'),
          f('site.established', 'Year of establishment'),
          f('site.schoolCode', 'School code'),
        ],
      },
      {
        title: 'Contact',
        fields: [
          f('site.phone1', 'Phone number 1', 'tel'),
          f('site.phone2', 'Phone number 2', 'tel'),
          f('site.emailGeneral', 'General email', 'email'),
          f('site.emailAdmissions', 'Admissions email', 'email'),
          f('site.address', 'Full address', 'textarea'),
          f('site.whatsappNumber', 'WhatsApp number (with 91, no +)', 'tel', 'Example: 919812550200'),
        ],
      },
      {
        title: 'Hours',
        fields: [
          f('site.hoursWeek', 'Weekday hours'),
          f('site.hoursSunday', 'Sunday hours'),
        ],
      },
    ],
  },
  {
    id: 'home',
    title: 'Home page (hero)',
    description: 'Website ke home page ka top section.',
    groups: [
      {
        title: 'Hero',
        fields: [
          f('home.hero.badge', 'Small badge above heading'),
          f('home.hero.lead', 'Heading line 1'),
          f('home.hero.name', 'Heading line 2 (highlighted)'),
          f('home.hero.tagline', 'Tagline under heading', 'textarea'),
          f('home.hero.intro', 'Intro paragraph', 'textarea'),
        ],
      },
    ],
  },
  {
    id: 'pages',
    title: 'Page headings',
    description:
      'Har public page ka H1 heading aur uske neeche ek line. Badalne par website par turant dikhega.',
    groups: [
      heroGroup('about', 'About'),
      heroGroup('academics', 'Academics'),
      heroGroup('admissions', 'Admissions'),
      heroGroup('application', 'Online Application'),
      heroGroup('blog', 'Blog & News'),
      heroGroup('contact', 'Contact'),
      heroGroup('enrollment', 'Enrollment'),
      heroGroup('facilities', 'Facilities'),
      heroGroup('fee', 'Fee Structure'),
      heroGroup('feedback', 'Feedback'),
      heroGroup('interview', 'Interview'),
      heroGroup('timing', 'School Timing'),
      heroGroup('streams', 'Streams'),
      {
        title: 'Gallery',
        fields: [
          f('gallery.hero.title', 'Heading line 1'),
          f('gallery.hero.name', 'Heading line 2 (gradient)'),
          f('gallery.hero.subtitle', 'One line under heading', 'textarea'),
        ],
      },
      {
        title: 'Results',
        fields: [
          f('results.hero.lead', 'Heading line 1'),
          f('results.hero.name', 'Heading line 2 (highlighted)'),
          f('results.hero.subtitle', 'One line under heading', 'textarea'),
        ],
      },
    ],
  },
  {
    id: 'seo',
    title: 'SEO (page title & description)',
    description:
      'Google/social share par dikhne wala title aur description. Change karne ke baad Google me thode dinon me update hoga.',
    groups: [
      {
        title: 'Pages',
        fields: publicRoutes.flatMap((route) => {
          const slug = route.path === '/' ? 'home' : route.path.replace(/^\//, '');
          const label = route.path === '/' ? 'Home page' : route.label;
          return [
            f(`seo.${slug}.title`, `${label} — Title`, 'text', 'Google me ~60 characters dikhte hain'),
            f(`seo.${slug}.description`, `${label} — Description`, 'textarea', 'Google me ~155 characters dikhte hain'),
          ];
        }),
      },
    ],
  },
];

/** Saari keys ek flat map me (admin save isse use karta hai). */
export const ALL_CONTENT_KEYS: string[] = Object.keys(DEFAULT_CONTENT);

interface SiteContentValue {
  /** Override ya default — hamesha kuch na kuch return karta hai. */
  get: (key: string, fallback?: string) => string;
  /** Sirf admin-saved overrides (default nahi). */
  overrides: Record<string, string>;
  /** true = server se content aa gaya (ya fail hoke defaults par settle ho gaya). */
  ready: boolean;
}

const SiteContentContext = createContext<SiteContentValue>({
  get: (_key, fallback) => fallback ?? '',
  overrides: {},
  ready: false,
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['site-content'],
    queryFn: () => apiGet<{ success?: boolean; data?: Record<string, unknown> }>('/content'),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const overrides = useMemo(() => {
    const raw = query.data?.data ?? {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (value === null || value === undefined) continue;
      out[key] = typeof value === 'string' ? value : String(value);
    }
    return out;
  }, [query.data]);

  const value = useMemo<SiteContentValue>(
    () => ({
      get: (key, fallback) => {
        const override = overrides[key];
        if (override !== undefined && override !== '') return override;
        const def = DEFAULT_CONTENT[key];
        if (def !== undefined && def !== '') return def;
        return fallback ?? '';
      },
      overrides,
      ready: query.isFetched,
    }),
    [overrides, query.isFetched],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentValue {
  return useContext(SiteContentContext);
}

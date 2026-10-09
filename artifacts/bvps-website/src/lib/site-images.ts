import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { baseGalleryImages, type GalleryItem } from '@/lib/gallery-data';
import type { HeroSlide } from '@/lib/hero-data';

export type { HeroSlide };

// ── Site images (gallery + hero) ──────────────────────────────────────────
// Ye keys `site_content` table me `image.*` prefix ke saath store hoti hain
// (data URLs) aur public `GET /api/content/images` se aati hain — normal
// `GET /api/content` me ye isliye nahi hain ki har page load par MBs download
// na ho. Gallery/hero pages hi inhe lazy load karte hain.

export const IMAGE_KEYS = {
  gallery: 'image.gallery',
  galleryHero: 'image.gallery.hero',
  homeHero: 'image.home.hero',
} as const;

export type GalleryAdminConfig = {
  hidden?: number[];
  overrides?: Record<string, Partial<GalleryItem>>;
  added?: GalleryItem[];
};

export type HomeHeroAdminConfig = {
  images?: Record<string, string>;
  hidden?: number[];
};

function safeParse<T>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return parsed as T;
    } catch { /* corrupt value — fallback use karo */ }
  }
  return fallback;
}

/** Base gallery list par admin ke hide/replace/add laga kar final list. */
export function applyGalleryConfig(base: GalleryItem[], cfg: GalleryAdminConfig): GalleryItem[] {
  const hidden = new Set(cfg.hidden ?? []);
  const overrides = cfg.overrides ?? {};
  const merged: GalleryItem[] = [];
  base.forEach((item, i) => {
    if (hidden.has(i)) return;
    const ov = overrides[String(i)];
    merged.push(ov ? { ...item, ...ov } : item);
  });
  for (const added of cfg.added ?? []) {
    if (added && added.src) merged.push(added);
  }
  return merged;
}

/** Hero slides par admin ke replace/hide laga kar final slides.
 *  Indices hamesha BASE list ke hain (hidden slides ke baad bhi). */
export function applyHeroConfig(base: HeroSlide[], cfg: HomeHeroAdminConfig): HeroSlide[] {
  const hidden = new Set(cfg.hidden ?? []);
  const images = cfg.images ?? {};
  const slides = base
    .map((slide, i) => {
      if (hidden.has(i)) return null;
      const src = images[String(i)];
      return src ? { ...slide, src } : slide;
    })
    .filter((s): s is HeroSlide => s !== null);
  // Sab kuch hide kar diya toh slider toot na jaaye — kam se kam ek slide dikhao.
  return slides.length ? slides : base;
}

/**
 * Site ke saare admin image overrides ek jagah se padho (`image.*` keys).
 * Public endpoint hai — koi auth nahi chahiye.
 */
export function useSiteImages() {
  const query = useQuery({
    queryKey: ['site-images'],
    queryFn: () => apiGet<{ success?: boolean; data?: Record<string, unknown> }>('/content/images'),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const map = query.data?.data ?? {};

  // NOTE: ye methods `this` use nahi karte (closures hain). Consumers inhe
  // destructure kar ke call karte hain (`const { getHomeHeroSlides } = ...`),
  // aur `this` wale object methods aise destructure hone par `undefined`
  // ho jaate the — jisse poora React app crash ho kar blank page aa jata tha.
  /** Raw string image (data URL / asset URL) — key se, nahi mila toh undefined. */
  const getImage = (key: string): string | undefined => {
    const v = map[key];
    return typeof v === 'string' && v ? v : undefined;
  };

  const getGalleryConfig = (): GalleryAdminConfig =>
    safeParse<GalleryAdminConfig>(map[IMAGE_KEYS.gallery], {});

  const getHomeHeroConfig = (): HomeHeroAdminConfig =>
    safeParse<HomeHeroAdminConfig>(map[IMAGE_KEYS.homeHero], {});

  /** Final public gallery list (base + admin overrides). */
  const getGalleryImages = (): GalleryItem[] =>
    applyGalleryConfig(baseGalleryImages, getGalleryConfig());

  /** Final public hero slides (base + admin overrides). */
  const getHomeHeroSlides = (base: HeroSlide[]): HeroSlide[] =>
    applyHeroConfig(base, getHomeHeroConfig());

  /** Gallery page ki featured (hero) photo — admin override ho toh wahi. */
  const getGalleryHeroImage = (): string | undefined =>
    getImage(IMAGE_KEYS.galleryHero);

  return {
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    refetch: query.refetch,
    getImage,
    getGalleryConfig,
    getHomeHeroConfig,
    getGalleryImages,
    getHomeHeroSlides,
    getGalleryHeroImage,
  };
}

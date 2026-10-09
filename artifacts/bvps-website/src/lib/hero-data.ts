import campusHeroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.webp';
import studentsSportsImg from '@assets/Screenshot_20260721_101418_1784611875385.webp';
import awardsImg from '@assets/Screenshot_20260721_101356_1784611875357.webp';
import karateChampImg from '@assets/Screenshot_20260721_101612_1784612008888.webp';
import footballGoldImg from '@assets/Screenshot_20260721_101549_1784612008898.webp';
import celebrationsImg from '@assets/Screenshot_20260721_101332_1784611875316.webp';

// Default home hero slides (code ke built-in list). Admin ke replace/hide
// `image.home.hero` site-content key me store hote hain — dono milkar website
// par dikhne wali final slides banate hain.
// Indices BASE list ke hain (site-images.ts `applyHeroConfig` wahi use karta
// hai), isliye list me insert/delete sirf end par hi karo.
export type HeroSlide = { src: string; label: string; tag: string };

export const baseHeroSlides: HeroSlide[] = [
  {
    src: campusHeroImg,
    label: 'Bal Vikas Public School Campus — Kalayat',
    tag: 'Trusted Since 2004',
  },
  {
    src: studentsSportsImg,
    label: 'Our Champion Students & Sports Teams',
    tag: 'District & State Winners',
  },
  {
    src: awardsImg,
    label: 'Excellence & Annual Prize Distribution Ceremony',
    tag: 'Merit & Honour',
  },
  {
    src: karateChampImg,
    label: 'State & District Karate Champions — BVPS Kalayat',
    tag: 'Discipline & Martial Arts',
  },
  {
    src: footballGoldImg,
    label: 'District Gold Medalists & Sports Excellence',
    tag: 'Victory Earned',
  },
  {
    src: celebrationsImg,
    label: 'Vibrant School Cultural Events & Celebrations',
    tag: 'Holistic Development',
  },
];

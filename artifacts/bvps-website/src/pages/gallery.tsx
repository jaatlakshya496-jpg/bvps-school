import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, ZoomIn, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import heroSchoolImg from '@assets/bal-vikas-public-school_1784611430239.jpg';

// All uploaded school photos
const galleryImages = [
  { src: new URL('@assets/Screenshot_20260721_095641_1784611430135.jpg', import.meta.url).href, caption: 'Lush Green Playground', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_095657_1784611430157.jpg', import.meta.url).href, caption: 'School Building — Multiple Views', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_095716_1784611430174.jpg', import.meta.url).href, caption: 'Teachers Celebrating Student Achievement', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_095726_1784611430190.jpg', import.meta.url).href, caption: 'Students in School Uniform', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_095741_1784611430208.jpg', import.meta.url).href, caption: 'Trophy Presentation Ceremony', category: 'Events & Achievements' },
  { src: new URL('@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg', import.meta.url).href, caption: 'Bal Vikas Public School — Kalayat', category: 'Campus' },
  { src: new URL('@assets/bal-vikas-public-school_1784611430239.jpg', import.meta.url).href, caption: 'School Front View', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_095810_1784611430254.jpg', import.meta.url).href, caption: 'School Activity', category: 'Events & Achievements' },
  { src: new URL('@assets/hqdefault_1784611430271.jpg', import.meta.url).href, caption: 'School Highlights', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_095911_1784611430287.jpg', import.meta.url).href, caption: 'School Life', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_095927_1784611430305.jpg', import.meta.url).href, caption: 'School Event', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_095945_1784611430331.jpg', import.meta.url).href, caption: 'Students Learning', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100014_1784611430350.jpg', import.meta.url).href, caption: 'School Celebration', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100046_1784611430370.jpg', import.meta.url).href, caption: 'Campus Life', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_100100_1784611430387.jpg', import.meta.url).href, caption: 'Student Activities', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100001_1784611430406.jpg', import.meta.url).href, caption: 'School Grounds', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_100117_1784611430422.jpg', import.meta.url).href, caption: 'Special Occasion', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100132_1784611430446.jpg', import.meta.url).href, caption: 'School Community', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_100232_1784611430471.jpg', import.meta.url).href, caption: 'School Ceremony', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100243_1784611430488.jpg', import.meta.url).href, caption: 'School Moments', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100254_1784611512184.jpg', import.meta.url).href, caption: 'Celebration at Bal Vikas Public School', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100305_1784611512306.jpg', import.meta.url).href, caption: 'Principal with Students at School Event', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100315_1784611512322.jpg', import.meta.url).href, caption: 'Autograph Session with Students', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100324_1784611512338.jpg', import.meta.url).href, caption: 'Students Celebrating Farewell', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100333_1784611512351.jpg', import.meta.url).href, caption: 'Victory Celebration at School', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100343_1784611512365.jpg', import.meta.url).href, caption: 'School Annual Event', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100353_1784611512376.jpg', import.meta.url).href, caption: 'Students at School Function', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100402_1784611512389.jpg', import.meta.url).href, caption: 'School Activity', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100415_1784611512404.jpg', import.meta.url).href, caption: 'Special School Occasion', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100424_1784611512419.jpg', import.meta.url).href, caption: 'Students Group at BVPS', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100434_1784611512437.jpg', import.meta.url).href, caption: 'School Celebration Moment', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100450_1784611512454.jpg', import.meta.url).href, caption: 'Staff and Students Together', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_100500_1784611512471.jpg', import.meta.url).href, caption: 'BVPS School Event', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100511_1784611512488.jpg', import.meta.url).href, caption: 'School Function', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100526_1784611512505.jpg', import.meta.url).href, caption: 'Students at Annual Day', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100547_1784611512526.jpg', import.meta.url).href, caption: 'School Cultural Program', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100558_1784611512543.jpg', import.meta.url).href, caption: 'Prize Distribution', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100609_1784611512558.jpg', import.meta.url).href, caption: 'School Community Gathering', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_100629_1784611512575.jpg', import.meta.url).href, caption: 'BVPS Annual Celebration', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100639_1784611512590.jpg', import.meta.url).href, caption: 'School Pride Moments', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100727_1784611828992.jpg', import.meta.url).href, caption: 'Teacher with Students on School Grounds', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_100735_1784611829011.jpg', import.meta.url).href, caption: 'Students Celebrating at School Event', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100744_1784611829028.jpg', import.meta.url).href, caption: 'Principal Addressing Students at Ceremony', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100807_1784611829045.jpg', import.meta.url).href, caption: 'BVPS — We Are Hiring!', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100828_1784611829062.jpg', import.meta.url).href, caption: 'Certificate Distribution — NCC Cadets', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100838_1784611829075.jpg', import.meta.url).href, caption: 'School Annual Celebration', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100848_1784611829087.jpg', import.meta.url).href, caption: 'Students at School Function', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100817_1784611829104.jpg', import.meta.url).href, caption: 'School Event Highlights', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100902_1784611829120.jpg', import.meta.url).href, caption: 'School Community Event', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100917_1784611829138.jpg', import.meta.url).href, caption: 'Students Group Activity', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_100929_1784611829154.jpg', import.meta.url).href, caption: 'School Special Occasion', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_100939_1784611829166.jpg', import.meta.url).href, caption: 'BVPS School Moment', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_100955_1784611829177.jpg', import.meta.url).href, caption: 'School Life', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101003_1784611829193.jpg', import.meta.url).href, caption: 'School Program', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101011_1784611829211.jpg', import.meta.url).href, caption: 'Students and Faculty Together', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_101018_1784611829229.jpg', import.meta.url).href, caption: 'School Pride', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101030_1784611875027.jpg', import.meta.url).href, caption: 'Govt. of Haryana — Winter Vacation Notice', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101040_1784611875129.jpg', import.meta.url).href, caption: 'Staff Meeting at School Campus', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_101102_1784611875141.jpg', import.meta.url).href, caption: 'Principal at TERI School of Advanced Studies', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_101123_1784611875157.jpg', import.meta.url).href, caption: 'New Year Celebration — BVPS Kalayat', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101136_1784611875176.jpg', import.meta.url).href, caption: 'Happy New Year Event — Students Performing', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101148_1784611875198.jpg', import.meta.url).href, caption: 'School Cultural Activity', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101203_1784611875216.jpg', import.meta.url).href, caption: 'Students at School Program', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101220_1784611875234.jpg', import.meta.url).href, caption: 'School Gathering', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_101232_1784611875252.jpg', import.meta.url).href, caption: 'BVPS School Moment', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101245_1784611875272.jpg', import.meta.url).href, caption: 'School Event Highlights', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101258_1784611875287.jpg', import.meta.url).href, caption: 'School Community', category: 'Staff & Faculty' },
  { src: new URL('@assets/Screenshot_20260721_101309_1784611875301.jpg', import.meta.url).href, caption: 'Students Learning Together', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101332_1784611875316.jpg', import.meta.url).href, caption: 'School Activity', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101341_1784611875336.jpg', import.meta.url).href, caption: 'BVPS Campus Life', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_101356_1784611875357.jpg', import.meta.url).href, caption: 'School Program', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101405_1784611875372.jpg', import.meta.url).href, caption: 'Students at School Function', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101418_1784611875385.jpg', import.meta.url).href, caption: 'School Special Occasion', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101433_1784611875396.jpg', import.meta.url).href, caption: 'School Life Moments', category: 'Students' },
  { src: new URL('@assets/Screenshot_20260721_101445_1784611875411.jpg', import.meta.url).href, caption: 'School Celebration', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101454_1784611875424.jpg', import.meta.url).href, caption: 'BVPS School Pride', category: 'Campus' },
  { src: new URL('@assets/Screenshot_20260721_101502_1784612008952.jpg', import.meta.url).href, caption: 'Achievement at BVPS', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101509_1784612008927.jpg', import.meta.url).href, caption: 'School Award Ceremony', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101517_1784612008914.jpg', import.meta.url).href, caption: 'Students Honoured at BVPS', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101549_1784612008898.jpg', import.meta.url).href, caption: 'BVPS Girls Win Gold — All India Karate Championship', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101612_1784612008888.jpg', import.meta.url).href, caption: 'Gold Medal Winner with Teachers — BVPS', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101624_1784612008874.jpg', import.meta.url).href, caption: 'Student Achievement Recognised at BVPS', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101706_1784612008853.jpg', import.meta.url).href, caption: 'Students and Staff with Trophies', category: 'Events & Achievements' },
  { src: new URL('@assets/Screenshot_20260721_101720_1784612008775.jpg', import.meta.url).href, caption: 'Trophy Presentation — BVPS Kalayat', category: 'Events & Achievements' },
];

const categories = ['All', 'Campus', 'Students', 'Staff & Faculty', 'Events & Achievements'];

// Animated card with useInView for scroll-triggered entrance
function GalleryCard({
  img,
  idx,
  onClick,
  layoutClass = '',
}: {
  img: typeof galleryImages[0];
  idx: number;
  onClick: () => void;
  layoutClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.45, delay: (idx % 8) * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.03, zIndex: 10 }}
      className={`relative group h-full min-h-[180px] overflow-hidden rounded-[1.35rem] bg-slate-900 shadow-md cursor-pointer md:min-h-[220px] ${layoutClass}`}
      onClick={onClick}
    >
      <motion.img
        src={img.src}
        alt={img.caption}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover brightness-105 contrast-105"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.5 }}
      />

      {/* Hover overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 p-3"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <ZoomIn className="w-8 h-8 text-white" />
        </motion.div>
        <p className="text-white text-xs font-semibold text-center leading-tight px-2 drop-shadow">{img.caption}</p>
        <span className="text-secondary text-[10px] font-bold uppercase tracking-wider">{img.category}</span>
      </motion.div>

      {/* Corner badge always visible */}
      <span className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {idx + 1}
      </span>
    </motion.div>
  );
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'All'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((p) => p !== null ? (p - 1 + filtered.length) % filtered.length : null); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((p) => p !== null ? (p + 1) % filtered.length : null); };

  return (
    <main>
      {/* Editorial Hero */}
      <section className="relative overflow-hidden bg-[#07101f] py-10 text-white md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,0.16),transparent_34%)]" />
        <div className="container relative mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[1.05fr_0.95fr] md:px-6">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-secondary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-secondary">The BVPS Archive</span>
            </div>
            <h1 className="font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
              Moments that
              <span className="block bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                stay with us.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
              Explore the people, places and celebrations that make Bal Vikas Public School a special part of Kalayat.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="font-bold text-white">{galleryImages.length}</span>
                <span className="ml-1.5 text-white/55">visual stories</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/55">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="h-2 w-2 rounded-full bg-pink-400" />
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Real moments from BVPS
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative rounded-[1.7rem] border border-white/20 bg-white/10 p-2 shadow-2xl">
              <img
                src={heroSchoolImg}
                alt="Bal Vikas Public School campus and activities"
                className="h-[280px] w-full rounded-[1.35rem] object-cover md:h-[330px] brightness-105 contrast-105"
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-white/15 bg-black/75 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">Featured story</p>
                  <p className="mt-1 text-sm font-semibold text-white">Life at Bal Vikas</p>
                </div>
                <Images className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-[72px] z-30 border-b border-white/10 bg-[#0c1729] shadow-xl">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20 scale-105'
                    : 'border border-white/10 bg-white/[0.07] text-white/60 hover:bg-white/15 hover:text-white'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'text-white/75' : 'text-white/40'}`}>
                    ({galleryImages.filter(i => i.category === cat).length})
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Grid */}
      <section className="min-h-[60vh] bg-[#f3f5f9] py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-500">Browse the collection</p>
              <h2 className="font-serif text-3xl font-bold text-[#07101f] md:text-4xl">Stories from school life</h2>
            </div>
            <motion.p
              key={activeCategory}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm"
            >
              {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' ? ` · ${activeCategory}` : ' · All stories'}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:grid-cols-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-4"
            >
              {filtered.map((img, idx) => (
                <GalleryCard
                  key={img.src}
                  img={img}
                  idx={idx}
                  onClick={() => setLightboxIndex(idx)}
                  layoutClass={
                    idx === 0
                      ? 'col-span-2 row-span-2'
                      : idx % 9 === 4
                        ? 'col-span-2 row-span-1'
                        : ''
                  }
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] overflow-hidden bg-black/95 flex items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Gallery counter */}
            <div className="absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 md:left-8 md:top-8">
              BVPS Gallery <span className="mx-1 text-secondary">•</span> {lightboxIndex + 1} / {filtered.length}
            </div>

            {/* Close */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={closeLightbox}
              aria-label="Close photo viewer"
              className="absolute right-5 top-5 z-10 rounded-full border border-white/15 bg-black/60 p-3 text-white shadow-lg transition-all hover:rotate-90 hover:border-secondary hover:bg-secondary hover:text-primary md:right-8 md:top-8"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Prev */}
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-white shadow-xl transition-all hover:scale-110 hover:bg-secondary hover:text-primary md:left-8"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.88, x: 60 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.88, x: -60 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-[1] flex max-h-[88vh] w-[min(92vw,1100px)] max-w-5xl flex-col items-center gap-3"
              >
                <div className="w-full rounded-[1.35rem] bg-gradient-to-br from-secondary via-amber-300 to-secondary p-[2px] shadow-2xl">
                  <div className="rounded-[1.25rem] border border-white/10 bg-black p-2 md:p-3">
                    <img
                      src={filtered[lightboxIndex].src}
                      alt={filtered[lightboxIndex].caption}
                      className="mx-auto max-h-[68vh] w-auto max-w-full rounded-[0.9rem] object-contain shadow-2xl brightness-105 contrast-105"
                    />
                  </div>
                </div>
                <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-black/80 px-5 py-3 text-center shadow-2xl md:px-8 md:py-4">
                  <p className="text-base font-bold text-white md:text-lg">{filtered[lightboxIndex].caption}</p>
                  <p className="mt-1 text-sm font-semibold text-secondary">{filtered[lightboxIndex].category}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next */}
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-white shadow-xl transition-all hover:scale-110 hover:bg-secondary hover:text-primary md:right-8"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Progress strip */}
            <div className="absolute bottom-4 left-1/2 z-10 flex max-w-xs -translate-x-1/2 flex-wrap justify-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-2">
              {filtered.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  aria-label={`View photo ${i + 1}`}
                  animate={{ backgroundColor: i === lightboxIndex ? '#f97316' : 'rgba(255,255,255,0.4)' }}
                  className={`h-1.5 rounded-full transition-all ${i === lightboxIndex ? 'w-6' : 'w-1.5 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

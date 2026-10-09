import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, ZoomIn, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import heroSchoolImg from '@assets/bal-vikas-public-school_1784611430239.webp';
import { PageSeo } from '@/lib/seo';
import { useSiteContent } from '@/lib/site-content';
import { useSiteImages } from '@/lib/site-images';
import { baseGalleryImages, type GalleryItem } from '@/lib/gallery-data';

const categories = ['All', 'Campus', 'Students', 'Staff & Faculty', 'Events & Achievements'];

// Animated card with useInView for scroll-triggered entrance
function GalleryCard({
  img,
  idx,
  onClick,
  layoutClass = '',
}: {
  img: GalleryItem;
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
  const { get } = useSiteContent();
  // Admin portal se replace/hide/add ki gayi photos (site-content `image.*` keys)
  const { getGalleryImages, getGalleryHeroImage } = useSiteImages();
  const galleryImages = getGalleryImages();
  const galleryHeroImg = getGalleryHeroImage() ?? heroSchoolImg;
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'All'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((p) => p !== null ? (p - 1 + filtered.length) % filtered.length : null); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((p) => p !== null ? (p + 1) % filtered.length : null); };

  return (
        <div>
      <PageSeo path="/gallery" />

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
  {get('gallery.hero.title', 'School Moments')}
  <span className="block bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
    {get('gallery.hero.name', 'at Bal Vikas Public School')}
  </span>
</h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
              {get('gallery.hero.subtitle', 'Explore the people, places and celebrations that make Bal Vikas Public School a special part of Kalayat.')}
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
                src={galleryHeroImg}
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
    </div>
  );
}

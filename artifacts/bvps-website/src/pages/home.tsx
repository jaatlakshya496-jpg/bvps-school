import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, GraduationCap, Building2, Calendar, ArrowRight, 
  ChevronLeft, ChevronRight, BookOpen, Dumbbell, Monitor, 
  ShieldCheck, Droplets, Maximize2, Quote, X, ZoomIn,
  Sparkles, TrendingUp, Award, Flame, CheckCircle2, MessageSquare,
  User, IndianRupee, Palette, Microscope, HeartHandshake,
  Star, Compass, Bell, Image as ImageIcon, FileText, PhoneCall
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

// High-resolution real BVPS school photos
import campusHeroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';
import studentsSportsImg from '@assets/Screenshot_20260721_101418_1784611875385.jpg';
import awardsImg from '@assets/Screenshot_20260721_101356_1784611875357.jpg';
import karateChampImg from '@assets/Screenshot_20260721_101612_1784612008888.jpg';
import footballGoldImg from '@assets/Screenshot_20260721_101549_1784612008898.jpg';
import celebrationsImg from '@assets/Screenshot_20260721_101332_1784611875316.jpg';

import libImg from '@assets/Screenshot_20260721_101220_1784611875234.jpg';
import compImg from '@assets/Screenshot_20260721_100132_1784611430446.jpg';
import smartImg from '@assets/Screenshot_20260721_100254_1784611512184.jpg';
import playImg from '@assets/Screenshot_20260721_101549_1784612008898.jpg';
import cctvImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';
import roImg from '@assets/Screenshot_20260721_100046_1784611430370.jpg';
import classImg from '@assets/Screenshot_20260721_101356_1784611875357.jpg';

// Highlights Configuration as requested
const schoolHighlights = [
  {
    icon: BookOpen,
    emoji: '📚',
    title: 'Quality Education',
    subtitle: 'Nursery to 12th Senior Secondary',
    desc: 'Complete NCERT & HBSE aligned curriculum with deep conceptual understanding.',
    accent: 'from-amber-500 to-orange-500',
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50/70',
    iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
  },
  {
    icon: Users,
    emoji: '👩‍🏫',
    title: 'Experienced & Dedicated Teachers',
    subtitle: '20+ Yrs Mentorship Experience',
    desc: 'Caring faculty providing personalized attention and academic mentorship to every student.',
    accent: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'bg-emerald-50/70',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30',
  },
  {
    icon: Monitor,
    emoji: '💻',
    title: 'Smart & Digital Learning',
    subtitle: '12 Interactive Smart Classes',
    desc: 'Audio-visual digital content and modern computer laboratory with internet access.',
    accent: 'from-blue-500 to-cyan-600',
    border: 'border-blue-200 hover:border-blue-400',
    bg: 'bg-blue-50/70',
    iconBg: 'bg-blue-600 text-white shadow-blue-600/30',
  },
  {
    icon: Microscope,
    emoji: '🔬',
    title: 'Practical Learning',
    subtitle: 'Hands-on Science & Experiments',
    desc: 'Focus on experiential learning, practical experiments, and real-world problem solving.',
    accent: 'from-purple-500 to-indigo-600',
    border: 'border-purple-200 hover:border-purple-400',
    bg: 'bg-purple-50/70',
    iconBg: 'bg-purple-600 text-white shadow-purple-600/30',
  },
  {
    icon: Dumbbell,
    emoji: '🏃',
    title: 'Sports & Activities',
    subtitle: 'District & State Champions',
    desc: 'Spacious grounds for cricket, football, volleyball, athletics, and professional karate training.',
    accent: 'from-rose-500 to-red-600',
    border: 'border-rose-200 hover:border-rose-400',
    bg: 'bg-rose-50/70',
    iconBg: 'bg-rose-600 text-white shadow-rose-600/30',
  },
  {
    icon: Palette,
    emoji: '🎨',
    title: 'Cultural & Creative Activities',
    subtitle: 'Arts, Music & Annual Celebrations',
    desc: 'Vibrant stage events, debate, music, drawing, and personality development programs.',
    accent: 'from-fuchsia-500 to-pink-600',
    border: 'border-fuchsia-200 hover:border-fuchsia-400',
    bg: 'bg-fuchsia-50/70',
    iconBg: 'bg-fuchsia-600 text-white shadow-fuchsia-600/30',
  },
  {
    icon: HeartHandshake,
    emoji: '🌱',
    title: 'Moral Values & Discipline',
    subtitle: 'Sanskars & Character Building',
    desc: 'Inculcating honesty, respect, Indian culture, punctuality, and civic responsibility.',
    accent: 'from-teal-500 to-emerald-600',
    border: 'border-teal-200 hover:border-teal-400',
    bg: 'bg-teal-50/70',
    iconBg: 'bg-teal-600 text-white shadow-teal-600/30',
  },
];

// Real BVPS hero images from top high-resolution uploaded photos
const heroSlides = [
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

const stats = [
  { 
    icon: Users, 
    label: 'Enrolled Students', 
    sublabel: 'Classes Nursery to 12th',
    value: 945, 
    suffix: '+',
    colorKey: 'cyan',
    theme: {
      cardBg: 'from-cyan-500/10 via-blue-500/5 to-white',
      border: 'border-cyan-300/80 hover:border-cyan-400',
      textGradient: 'from-cyan-600 via-blue-600 to-indigo-700',
      iconBox: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 ring-4 ring-cyan-100',
      badge: 'bg-cyan-100/90 text-cyan-900 border-cyan-300',
      pulseDot: 'bg-cyan-500',
      glowShadow: 'hover:shadow-cyan-500/20',
      barGradient: 'from-cyan-500 to-blue-600',
    },
    badgeText: 'Active Learners',
    infoNote: '100% Board Pass Rate & Sports Champions',
    tagIcon: Sparkles
  },
  { 
    icon: GraduationCap, 
    label: 'Expert Teachers', 
    sublabel: 'Dedicated & Caring Faculty',
    value: 29, 
    suffix: '+',
    colorKey: 'emerald',
    theme: {
      cardBg: 'from-emerald-500/10 via-teal-500/5 to-white',
      border: 'border-emerald-300/80 hover:border-emerald-400',
      textGradient: 'from-emerald-600 via-teal-600 to-green-700',
      iconBox: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-100',
      badge: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
      pulseDot: 'bg-emerald-500',
      glowShadow: 'hover:shadow-emerald-500/20',
      barGradient: 'from-emerald-500 to-teal-600',
    },
    badgeText: 'Expert Mentors',
    infoNote: 'Individual Student Mentorship',
    tagIcon: Award
  },
  { 
    icon: Building2, 
    label: 'Smart Classrooms', 
    sublabel: 'Ventilated & Digitally Equipped',
    value: 31, 
    suffix: '',
    colorKey: 'purple',
    theme: {
      cardBg: 'from-purple-500/10 via-indigo-500/5 to-white',
      border: 'border-purple-300/80 hover:border-purple-400',
      textGradient: 'from-purple-600 via-fuchsia-600 to-indigo-700',
      iconBox: 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30 ring-4 ring-purple-100',
      badge: 'bg-purple-100/90 text-purple-900 border-purple-300',
      pulseDot: 'bg-purple-500',
      glowShadow: 'hover:shadow-purple-500/20',
      barGradient: 'from-purple-500 to-indigo-600',
    },
    badgeText: 'Hi-Tech Campus',
    infoNote: '12 Smart Classes & Computer Lab',
    tagIcon: TrendingUp
  },
  { 
    icon: Calendar, 
    label: 'Glorious Legacy', 
    sublabel: '21+ Years of Excellence',
    value: 2004, 
    suffix: '',
    colorKey: 'amber',
    theme: {
      cardBg: 'from-amber-500/10 via-orange-500/5 to-white',
      border: 'border-amber-300/80 hover:border-amber-400',
      textGradient: 'from-amber-600 via-orange-600 to-yellow-600',
      iconBox: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 ring-4 ring-amber-100',
      badge: 'bg-amber-100/90 text-amber-900 border-amber-300',
      pulseDot: 'bg-amber-500',
      glowShadow: 'hover:shadow-amber-500/20',
      barGradient: 'from-amber-500 to-orange-500',
    },
    badgeText: 'Since 2004',
    infoNote: 'Trusted by Generations in Kalayat',
    tagIcon: Flame
  },
];

function CountUp({ 
  value, 
  suffix = '', 
  className = '',
  onComplete 
}: { 
  value: number; 
  suffix?: string; 
  className?: string;
  onComplete?: () => void;
}) {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return;

    let frame = 0;
    let observer: IntersectionObserver | undefined;

    const animate = () => {
      const start = performance.now();
      const duration = 1600;
      const update = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // smooth easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.round(value * eased);
        setCount(currentVal);
        if (progress < 1) {
          frame = requestAnimationFrame(update);
        } else {
          setIsFinished(true);
          onComplete?.();
        }
      };
      frame = requestAnimationFrame(update);
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer?.disconnect();
        }
      }, { threshold: 0.25 });
      observer.observe(element);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [value, onComplete]);

  return (
    <motion.span 
      ref={numberRef}
      animate={isFinished ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`inline-block tabular-nums font-serif font-black tracking-tight ${className}`}
    >
      {count.toLocaleString('en-IN')}{suffix}
    </motion.span>
  );
}

const facilities = [
  { icon: BookOpen,   name: 'Rich Library',       count: '2,000+ Books', desc: 'Well-stocked library with textbooks, storybooks, and reference materials.',   image: libImg  },
  { icon: Monitor,    name: 'Computer Lab',    count: '25+ Systems',  desc: 'Modern computer lab with guided digital learning and internet access.',       image: compImg },
  { icon: Monitor,    name: 'Smart Classes',   count: '12 Rooms',    desc: 'Interactive audio-visual learning boards for clear conceptual understanding.', image: smartImg},
  { icon: Dumbbell,   name: 'Spacious Playground', count: '1 Large Ground', desc: 'Expansive open ground for cricket, football, karate, and daily athletics.', image: playImg },
  { icon: ShieldCheck,name: '24/7 CCTV Security', count: 'Full Campus', desc: 'Round-the-clock camera monitoring ensuring complete student safety.',      image: cctvImg },
  { icon: Droplets,   name: 'RO Drinking Water', count: 'Chilled & Pure', desc: 'Multi-stage RO purification plants providing clean drinking water.',       image: roImg },
  { icon: Maximize2,  name: 'Spacious Classrooms', count: '31 Classrooms', desc: 'Well-lit, airy, and ventilated classrooms designed for comfortable study.', image: classImg},
];

// Gallery preview - top high-definition real photos
const previewPhotos = [
  { src: new URL('@assets/Screenshot_20260721_101418_1784611875385.jpg', import.meta.url).href, title: 'Student Sports Achievers' },
  { src: new URL('@assets/Screenshot_20260721_101356_1784611875357.jpg', import.meta.url).href, title: 'Annual Award Ceremony' },
  { src: new URL('@assets/Screenshot_20260721_101612_1784612008888.jpg', import.meta.url).href, title: 'Karate Championship Winners' },
  { src: new URL('@assets/Screenshot_20260721_101517_1784612008914.jpg', import.meta.url).href, title: 'School Football Squad' },
  { src: new URL('@assets/Screenshot_20260721_101405_1784611875372.jpg', import.meta.url).href, title: 'Trophy Presentation' },
  { src: new URL('@assets/Screenshot_20260721_101720_1784612008775.jpg', import.meta.url).href, title: 'School Gathering & Pride' },
];

type Facility = typeof facilities[number];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title: string } | null>(null);
  const { t } = useLanguage();

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setSelectedFacility(null);
        setLightboxImg(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const prev = () => setCurrentSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);
  const next = () => setCurrentSlide((s) => (s + 1) % heroSlides.length);

  return (
    <div className="flex flex-col">

      {/* ── HERO SLIDESHOW ── */}
      <section className="relative h-[88vh] min-h-[540px] max-h-[780px] overflow-hidden bg-black">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlide].src}
              alt={heroSlides[currentSlide].label}
              className="w-full h-full object-cover object-center brightness-105 contrast-105"
            />
            {/* Crisp natural shadow for pure photo view with readable text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center items-start z-10 container mx-auto px-4 md:px-10">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-primary font-bold text-xs sm:text-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Admissions Open 2025–26
              </span>
              <span className="inline-flex px-3 py-1 rounded-full bg-black/50 text-amber-300 text-xs font-semibold border border-amber-300/30 backdrop-blur-xs">
                📍 Kalayat, Kaithal
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-[1.1] mb-2 drop-shadow-md">
              Welcome to <br />
              <span className="text-secondary">Bal Vikas Public School</span>
            </h1>

            <p className="text-sm sm:text-lg text-amber-200 font-semibold italic mb-3 tracking-wide drop-shadow">
              “Empowering Young Minds, Building Bright Futures.”
            </p>

            <p className="text-xs sm:text-sm md:text-base text-white/90 mb-6 max-w-2xl leading-relaxed font-normal bg-black/35 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
              Bal Vikas Public School mein hum students ko quality education ke saath discipline, confidence aur strong moral values dene par focus karte hain. Hamara goal hai ki har student apni knowledge aur talent ko develop karke future ke liye ready ho.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/application"
                className="inline-flex items-center justify-center h-11 sm:h-12 px-6 sm:px-7 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full text-xs sm:text-sm transition-all shadow-lg hover:shadow-secondary/30 hover:scale-105"
              >
                Apply for Admission
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center h-11 sm:h-12 px-6 sm:px-7 border-2 border-white text-white hover:bg-white hover:text-primary font-bold rounded-full text-xs sm:text-sm bg-black/30 transition-all hover:scale-105"
              >
                View High-Res Photos
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-11 sm:h-12 px-5 border border-white/40 text-white hover:bg-white/20 font-semibold rounded-full text-xs transition-all"
              >
                Contact School
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide nav buttons */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-secondary hover:text-primary text-white flex items-center justify-center border border-white/20 transition-all shadow-lg hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-secondary hover:text-primary text-white flex items-center justify-center border border-white/20 transition-all shadow-lg hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots & Current Slide Info */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 h-2.5 bg-secondary' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>

        {/* Slide label */}
        <div className="hidden md:block absolute bottom-6 right-8 z-20 bg-black/70 border border-white/15 px-4 py-1.5 rounded-full text-white/90 text-xs font-semibold">
          {heroSlides[currentSlide].label}
        </div>
      </section>

      {/* ── OUR HIGHLIGHTS SECTION ── */}
      <section className="py-16 bg-white relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 md:px-10 max-w-6xl">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Excellence & Values</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight">
              Our Highlights
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
              Bal Vikas Public School, Kalayat brings together all elements of a successful, inspiring student life.
            </p>
            <div className="w-20 h-1 bg-secondary mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {schoolHighlights.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
                whileHover={{ y: -5 }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border ${item.border} ${item.bg} shadow-xs hover:shadow-lg transition-all duration-300 group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-md ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl">{item.emoji}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-700/80 mt-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span>Explore detail</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── WHY CHOOSE BAL VIKAS PUBLIC SCHOOL? ── */}
      <section className="py-14 bg-gradient-to-br from-primary via-[#0a2540] to-primary text-white relative overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-10 max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
              <Star className="w-3.5 h-3.5 fill-secondary" />
              <span>Core Philosophy</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Why Choose Bal Vikas Public School?
            </h2>

            {/* Core Quote Box */}
            <div className="max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl relative">
              <Quote className="w-10 h-10 text-secondary/50 mx-auto mb-3" />
              <blockquote className="text-lg sm:text-2xl md:text-3xl font-serif italic font-semibold text-amber-200 leading-snug">
                “Education is not just about marks, it is about developing knowledge, character and confidence.”
              </blockquote>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="w-8 h-0.5 bg-secondary rounded-full" />
                <span className="text-xs uppercase tracking-widest text-white/80 font-bold">Bal Vikas Public School, Kalayat</span>
                <span className="w-8 h-0.5 bg-secondary rounded-full" />
              </div>
            </div>

            {/* Quick Action Navigation Bar: Latest Notices | Gallery | Admissions | Contact Us */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/school-timing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-primary font-bold text-xs sm:text-sm border border-white/25 shadow-md transition-all hover:scale-105"
              >
                <Bell className="w-4 h-4 text-secondary" />
                Latest Notices
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-primary font-bold text-xs sm:text-sm border border-white/25 shadow-md transition-all hover:scale-105"
              >
                <ImageIcon className="w-4 h-4 text-secondary" />
                Gallery
              </Link>
              <Link
                href="/application"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary text-primary hover:bg-secondary/90 font-bold text-xs sm:text-sm shadow-lg hover:scale-105 transition-all"
              >
                <FileText className="w-4 h-4" />
                Admissions
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-primary font-bold text-xs sm:text-sm border border-white/25 shadow-md transition-all hover:scale-105"
              >
                <PhoneCall className="w-4 h-4 text-secondary" />
                Contact Us
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP (VIBRANT THEME & ANIMATIONS) ── */}
      <section className="py-14 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Ambient background glowing orbs */}
        <div className="absolute -top-24 left-10 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-10 max-w-6xl relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-spin" style={{ animationDuration: '6s' }} />
              <span>BVPS Key Milestones & Strength</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-tight">
              Numbers That Define Our Excellence
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
              Over two decades of shaping bright minds, character, sports champions, and academic leaders in Kalayat.
            </p>
          </div>

          {/* Cards Grid with Individual Theming, Gradients & Animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -7, scale: 1.02 }}
                className={`group relative flex flex-col justify-between bg-gradient-to-b ${stat.theme.cardBg} rounded-3xl p-6 shadow-sm hover:shadow-xl ${stat.theme.glowShadow} border-2 ${stat.theme.border} transition-all duration-300 overflow-hidden cursor-default`}
              >
                {/* Sheen reflection sweep animation on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 pointer-events-none" />

                {/* Top Row: Icon + Pulsing Status Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    {/* Glowing Animated Icon */}
                    <motion.div 
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                      className={`w-14 h-14 rounded-2xl ${stat.theme.iconBox} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
                    >
                      <stat.icon className="w-7 h-7" />
                    </motion.div>

                    {/* Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-2xs ${stat.theme.badge}`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stat.theme.pulseDot} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${stat.theme.pulseDot}`}></span>
                      </span>
                      {stat.badgeText}
                    </span>
                  </div>

                  {/* Number & Counting Animation */}
                  <div className="my-1">
                    <p className="text-4xl sm:text-5xl leading-none">
                      <span className={`bg-gradient-to-r ${stat.theme.textGradient} bg-clip-text text-transparent font-serif font-black`}>
                        <CountUp value={stat.value} suffix={stat.suffix} />
                      </span>
                    </p>

                    <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-primary transition-colors">
                      {stat.label}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                      {stat.sublabel}
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight Strip */}
                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold truncate">
                    <stat.tagIcon className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="truncate">{stat.infoNote}</span>
                  </span>
                  
                  {/* Subtle animated bar */}
                  <div className="w-8 h-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className={`h-full bg-gradient-to-r ${stat.theme.barGradient} rounded-full`}
                    />
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PRINCIPAL'S MESSAGE ── */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary rounded-3xl px-6 sm:px-10 md:px-12 py-10 sm:py-12 flex flex-col md:flex-row gap-8 sm:gap-10 items-center relative overflow-hidden shadow-2xl border border-secondary/20"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full -translate-y-1/3 translate-x-1/3 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl pointer-events-none" />

            {/* Enhanced Photo with Badges */}
            <div className="shrink-0 flex flex-col items-center gap-3 relative z-10">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl p-1 bg-gradient-to-tr from-secondary via-amber-300 to-secondary shadow-2xl">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 border-2 border-white/20">
                    <img
                      src={new URL('@assets/principal-ramphal-sharma.png', import.meta.url).href}
                      alt="Sh. Ramphal Sharma — Principal & Founder"
                      className="w-full h-full object-cover object-top filter brightness-[1.03]"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-secondary text-primary font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md border border-amber-200">
                  {t('principal.experience', '20+ Yrs Exp.')}
                </div>
              </div>

              <div className="text-center mt-1">
                <p className="text-white font-serif font-bold text-lg text-center leading-tight">{t('principal.name', 'Sh. Ramphal Sharma')}</p>
                <p className="text-secondary text-xs font-semibold uppercase tracking-wider mt-0.5">{t('principal.role', 'Principal & Founder')}</p>
                <p className="text-amber-200/90 text-[11px]">{t('principal.educatorRole', 'Senior Hindi Educator')}</p>
              </div>
            </div>

            {/* Message & Core Philosophy */}
            <div className="relative z-10 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 fill-secondary" /> {t('home.principalTag', 'Noble Thoughts, Discipline & Character')}
              </div>
              <Quote className="w-8 h-8 text-secondary/40 mb-2 mx-auto md:mx-0" />
              <p className="text-white/95 text-base sm:text-lg leading-relaxed italic font-serif">
                {t('principal.quote')}
              </p>

              {/* 3 Value Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-left">
                <div className="bg-white/10 rounded-xl p-2 border border-white/10 text-center">
                  <p className="text-secondary font-bold text-xs">{t('principal.experienceBadgeTitle', '20+ Years')}</p>
                  <p className="text-white/70 text-[10px] leading-tight">{t('principal.experienceBadgeSub', 'Teaching Experience')}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2 border border-white/10 text-center">
                  <p className="text-secondary font-bold text-xs">{t('principal.hindiEducatorTitle', 'Hindi Educator')}</p>
                  <p className="text-white/70 text-[10px] leading-tight">{t('principal.hindiEducatorSub', 'Literature & Grammar')}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2 border border-white/10 text-center">
                  <p className="text-secondary font-bold text-xs">{t('principal.nobleThoughtsTitle', 'Noble Thoughts')}</p>
                  <p className="text-white/70 text-[10px] leading-tight">{t('principal.nobleThoughtsSub', 'Values & Character')}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex items-center justify-center md:justify-start">
                <Link href="/principal-message#message-form" className="inline-flex items-center gap-1.5 bg-secondary text-primary font-bold text-xs px-5 py-2.5 rounded-full hover:bg-secondary/90 transition-all shadow-md active:scale-95">
                  <MessageSquare className="w-3.5 h-3.5" /> {t('home.messagePrincipalBtn', 'Message Principal Direct')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-secondary font-bold uppercase tracking-widest text-xs sm:text-sm">Campus Highlights</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mt-1">School Facilities & Infrastructure</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
            <p className="text-primary-foreground/80 text-sm sm:text-base max-w-2xl mx-auto mt-3">
              Equipped with modern amenities, smart classrooms, sports grounds, and a rich library to foster comprehensive student growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {facilities.map((f, i) => (
              <motion.button
                key={f.name}
                onClick={() => setSelectedFacility(f)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-white/20 flex flex-col text-left cursor-pointer transition-all duration-300 group"
              >
                <div className="relative w-full h-44 overflow-hidden bg-slate-900">
                  <img
                    src={f.image}
                    alt={f.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-105 contrast-105"
                  />
                  <div className="absolute top-3 right-3 bg-secondary text-primary font-bold text-[11px] px-2.5 py-1 rounded-full shadow-md">
                    {f.count}
                  </div>
                  <div className="absolute bottom-3 left-3 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <f.icon className="w-4 h-4 text-secondary" />
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-primary transition-colors">{f.name}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed flex-1">{f.desc}</p>
                  <span className="mt-3 text-primary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details & Photo →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/facilities" className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold px-7 py-3 rounded-full text-sm shadow-md transition-all">
              Explore All School Facilities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PHOTO PREVIEW (High Definition) ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <span className="text-secondary font-bold uppercase tracking-widest text-xs sm:text-sm">Vibrant Campus Life</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black mt-1">High-Definition School Moments</h2>
              <p className="text-muted-foreground text-sm mt-1">Click on any photo to view in crystal-clear full resolution.</p>
            </div>
            <Link href="/gallery" className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-bold px-6 py-2.5 rounded-full text-sm shadow-sm hover:shadow transition-all shrink-0">
              View All Photos in Gallery <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {previewPhotos.map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                onClick={() => setLightboxImg(photo)}
                className={`group relative rounded-2xl overflow-hidden shadow-md cursor-pointer border border-border/60 aspect-square ${i === 0 ? 'md:row-span-2 md:aspect-auto' : ''}`}
              >
                <img 
                  src={photo.src} 
                  alt={photo.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-105 contrast-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-white">
                    <span className="font-semibold text-sm drop-shadow">{photo.title}</span>
                    <div className="p-2 rounded-full bg-secondary text-primary">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX FULL-RES PHOTO MODAL ── */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setLightboxImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={lightboxImg.src}
                alt={lightboxImg.title}
                className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border-2 border-white/20"
              />
              <p className="text-white font-serif font-bold text-lg mt-3 text-center">{lightboxImg.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FACILITY IMAGE MODAL ── */}
      <AnimatePresence>
        {selectedFacility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedFacility(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-900">
                <img
                  src={selectedFacility.image}
                  alt={selectedFacility.name}
                  className="w-full h-full object-cover brightness-105 contrast-105"
                />
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary shrink-0">
                    <selectedFacility.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-xl">{selectedFacility.name}</h3>
                </div>
              </div>
              {/* Text */}
              <div className="px-6 py-5">
                <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                  {selectedFacility.count}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{selectedFacility.desc}</p>
                <Link
                  href="/facilities"
                  className="mt-4 inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:text-secondary transition-colors"
                  onClick={() => setSelectedFacility(null)}
                >
                  View full facilities page <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="container mx-auto px-4 md:px-10 relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">Join the BVPS Family</h2>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8">
              Admissions open for Classes 1 to 12. Give your child the foundation they deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/application" className="inline-flex items-center justify-center h-13 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-9 text-base transition-all shadow-lg hover:scale-105">
                Start Admission
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center h-13 border-2 border-white text-white hover:bg-white hover:text-primary font-bold rounded-full px-9 text-base transition-all bg-white/10 backdrop-blur-sm hover:scale-105">
                Contact School
              </Link>
            </div>
            <p className="mt-8 text-white/60 text-xs sm:text-sm">
              Railway Road, Kalayat, Kaithal &nbsp;|&nbsp; Helpline: +91 98125 50200
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


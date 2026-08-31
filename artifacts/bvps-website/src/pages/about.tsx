import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { 
  Target, BookOpen, Clock, Heart, Award, Quote, X, ArrowRight, Flag, 
  Building2, Trophy, Users, ShieldCheck, HeartHandshake, Scale, CheckCircle2, 
  Flame, Palette, UserCheck, Sparkles, Star, Eye
} from 'lucide-react';
import aboutImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';
import principalImg from '@assets/principal-ramphal-sharma.png';
import schoolBuildingImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';
import studentsImg from '@assets/Screenshot_20260721_101418_1784611875385.jpg';
import campusImg from '@assets/Screenshot_20260721_101549_1784612008898.jpg';
import schoolEventImg from '@assets/Screenshot_20260721_101332_1784611875316.jpg';
import { useLanguage } from '@/lib/language-context';

const schoolValues = [
  {
    name: 'Discipline',
    emoji: '🛡️',
    icon: ShieldCheck,
    desc: 'Self-control, punctuality, and respect for school rules and social harmony.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50/80',
    border: 'border-blue-200 hover:border-blue-400',
  },
  {
    name: 'Respect',
    emoji: '🤝',
    icon: HeartHandshake,
    desc: 'Valuing teachers, parents, peers, cultural traditions, and diverse perspectives.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200 hover:border-emerald-400',
  },
  {
    name: 'Honesty',
    emoji: '⚖️',
    icon: Scale,
    desc: 'Upholding truthfulness, high moral integrity, and sincere ethical conduct.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50/80',
    border: 'border-amber-200 hover:border-amber-400',
  },
  {
    name: 'Responsibility',
    emoji: '🎯',
    icon: CheckCircle2,
    desc: 'Taking ownership of learning, personal duties, and positive civic contribution.',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50/80',
    border: 'border-purple-200 hover:border-purple-400',
  },
  {
    name: 'Hard Work',
    emoji: '⚡',
    icon: Flame,
    desc: 'Relentless effort, focus, resilience, and commitment to academic excellence.',
    color: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50/80',
    border: 'border-rose-200 hover:border-rose-400',
  },
  {
    name: 'Creativity',
    emoji: '🎨',
    icon: Palette,
    desc: 'Encouraging curiosity, original thinking, arts, and innovative solutions.',
    color: 'from-fuchsia-500 to-pink-600',
    bg: 'bg-fuchsia-50/80',
    border: 'border-fuchsia-200 hover:border-fuchsia-400',
  },
  {
    name: 'Teamwork',
    emoji: '👥',
    icon: Users,
    desc: 'Collaborating enthusiastically, sportsmanship, and lifting each other up.',
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50/80',
    border: 'border-cyan-200 hover:border-cyan-400',
  },
];

const overviewCards = [
  {
    icon: Award,
    title: 'School Type',
    desc: 'Private, Co-educational\n(Boys & Girls)',
    image: schoolBuildingImg,
    detail: 'Bal Vikas Public School is a private co-educational institution welcoming both boys and girls from Class 1 to 12, fostering a balanced and inclusive learning environment.',
  },
  {
    icon: BookOpen,
    title: 'Academic Level',
    desc: 'Senior Secondary\n(Classes 1 to 12)',
    image: studentsImg,
    detail: 'We offer a complete academic journey from primary through senior secondary (Class 12), preparing students for board exams and higher education.',
  },
  {
    icon: Heart,
    title: 'Medium',
    desc: 'Hindi Medium Instruction\nwith English integration',
    image: schoolEventImg,
    detail: 'Instruction is delivered in Hindi to keep students rooted in their language, while English is integrated across subjects to build confidence in both languages.',
  },
  {
    icon: Clock,
    title: 'School Hours',
    desc: 'Mon–Sat: 8:00 AM – 3:00 PM\nSunday: Closed',
    image: campusImg,
    detail: 'School runs six days a week, Monday to Saturday, from 8:00 AM to 3:00 PM. Morning assembly begins the day, building discipline and community spirit.',
  },
];

type OverviewCard = typeof overviewCards[number];

const journeyMilestones = [
  {
    year: '2004',
    title: 'A Vision Takes Root',
    description: 'Bal Vikas Public School began with a simple promise — to bring meaningful, quality education closer to the families of Kalayat.',
    image: schoolBuildingImg,
    icon: Flag,
    color: 'from-orange-500 to-amber-400',
  },
  {
    year: 'Growing Years',
    title: 'Building Strong Foundations',
    description: 'With dedicated teachers and a values-first approach, BVPS grew into a trusted school community where every child could feel seen and supported.',
    image: campusImg,
    icon: Building2,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    year: 'Classes 1–12',
    title: 'A Complete Learning Journey',
    description: 'The school expanded its academic journey from primary years through senior secondary, helping students grow with confidence at every stage.',
    image: studentsImg,
    icon: Trophy,
    color: 'from-fuchsia-500 to-purple-500',
  },
  {
    year: 'Today',
    title: 'A Community in Motion',
    description: 'Today, 945+ students, 29+ teachers and 31 classrooms carry the BVPS story forward through learning, sports, creativity and achievement.',
    image: schoolEventImg,
    icon: Users,
    color: 'from-emerald-500 to-teal-400',
  },
];

function CountUp({ 
  value, 
  suffix = '', 
  className = '' 
}: { 
  value: number; 
  suffix?: string; 
  className?: string; 
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
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.round(value * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(update);
        } else {
          setIsFinished(true);
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
  }, [value]);

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

export default function About() {
  const [selected, setSelected] = useState<OverviewCard | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={aboutImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">About BVPS</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full"></div>
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Nurturing minds and shaping futures in Kalayat since 2004.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Main About Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <ScrollReveal direction="right">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-primary text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>Kalayat, Kaithal (Haryana)</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-black leading-tight">
                  About Bal Vikas Public School
                </h2>
                
                <div className="space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed">
                  <p className="font-medium bg-amber-50/80 p-4 rounded-2xl border-l-4 border-secondary text-slate-800 shadow-2xs">
                    Bal Vikas Public School, Kalayat, Kaithal is dedicated to providing students with a positive and supportive learning environment. School ka focus academic education ke saath students ke overall development par hai.
                  </p>
                  <p className="text-slate-600">
                    Hum students ko aisa environment dene ka prayas karte hain jahan woh confidently learn karein, apni creativity ko explore karein aur responsible individuals ban sakein.
                  </p>
                  <p className="text-sm text-slate-500 italic">
                    Established in 2004, the school has grown into a prestigious institution providing co-educational instruction from Classes 1 to 12.
                  </p>
                </div>

                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 border-t border-border mt-8">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-white border border-amber-200/80 shadow-2xs hover:shadow-md transition-all">
                    <p className="text-2xl sm:text-3xl font-serif font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      <CountUp value={2004} />
                    </p>
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mt-1">Established</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-white border border-cyan-200/80 shadow-2xs hover:shadow-md transition-all">
                    <p className="text-2xl sm:text-3xl font-serif font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      <CountUp value={945} suffix="+" />
                    </p>
                    <p className="text-[11px] font-bold text-cyan-900 uppercase tracking-wider mt-1">Students</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-white border border-emerald-200/80 shadow-2xs hover:shadow-md transition-all">
                    <p className="text-2xl sm:text-3xl font-serif font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      <CountUp value={29} suffix="+" />
                    </p>
                    <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mt-1">Teachers</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-500/10 to-white border border-purple-200/80 shadow-2xs hover:shadow-md transition-all">
                    <p className="text-2xl sm:text-3xl font-serif font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      <CountUp value={12} suffix="th" />
                    </p>
                    <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mt-1">Classes 1–12</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-900 border border-border/80 group">
                <img 
                  src={aboutImg} 
                  alt="Bal Vikas Public School Campus Kalayat" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-105 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="font-serif font-bold text-lg">Bal Vikas Public School, Kalayat</p>
                  <p className="text-xs text-amber-300 font-medium">Safe, Inspiring & Modern Learning Environment</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Mission & Vision Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <ScrollReveal delay={0.1}>
              <div className="bg-gradient-to-br from-white to-amber-50/50 p-8 sm:p-10 rounded-3xl border-2 border-amber-300 shadow-md h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Direction & Purpose</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2">
                      Our Mission 🎯
                    </h3>
                  </div>
                </div>
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed relative z-10 font-medium">
                  Students ko quality education aur practical learning ke through knowledge, confidence, discipline aur good values develop karne mein help karna.
                </p>
                <div className="mt-6 pt-4 border-t border-amber-200/80 flex items-center gap-2 text-xs font-bold text-amber-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quality Learning • Confidence • Moral Values</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-gradient-to-br from-primary via-[#0a2540] to-primary text-white p-8 sm:p-10 rounded-3xl shadow-xl h-full relative overflow-hidden group border border-secondary/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center shadow-lg shadow-secondary/25">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">Future Aspiration</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
                      Our Vision 👁️
                    </h3>
                  </div>
                </div>
                <p className="text-white/90 text-base sm:text-lg leading-relaxed relative z-10 font-medium">
                  Aise responsible, confident aur knowledgeable students develop karna jo apne future mein success ke saath society ke liye bhi positive contribution karein.
                </p>
                <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2 text-xs font-bold text-secondary">
                  <Star className="w-4 h-4 fill-secondary" />
                  <span>Academic Success • Social Contribution • Future Leaders</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Our Values Section */}
          <ScrollReveal>
            <div className="mb-20 bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-md relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                  <Star className="w-3.5 h-3.5 fill-secondary" />
                  <span>Ethical Foundation</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 flex items-center justify-center gap-2">
                  Our Values 🌟
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
                  The enduring principles that guide every classroom, sports field, and student at Bal Vikas Public School.
                </p>
                <div className="w-20 h-1 bg-secondary mx-auto mt-4 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {schoolValues.map((val, idx) => (
                  <motion.div
                    key={val.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`p-5 rounded-2xl border ${val.border} ${val.bg} flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 group`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${val.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          <val.icon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl">{val.emoji}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {val.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {val.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>BVPS Pillar</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Principal's Message Section */}
          <ScrollReveal>
            <div className="mb-24 bg-gradient-to-br from-primary via-[#082038] to-primary rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative border-2 border-secondary/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full -translate-y-1/3 translate-x-1/3 blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                
                {/* Styled Principal Photo */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl p-1.5 bg-gradient-to-tr from-secondary via-amber-300 to-secondary shadow-2xl">
                      <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-900 border-2 border-white/20">
                        <img 
                          src={principalImg} 
                          alt="Sh. Ramphal Sharma - Principal & Founder" 
                          className="w-full h-full object-cover object-top filter brightness-[1.03]" 
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-secondary text-primary font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-md border border-amber-200">
                      20+ Yrs Experience
                    </div>
                  </div>

                  <div className="text-center mt-1">
                    <p className="text-white font-serif font-bold text-xl leading-tight">Sh. Ramphal Sharma</p>
                    <p className="text-secondary text-xs font-bold uppercase tracking-wider mt-0.5">Principal & Founder</p>
                    <p className="text-amber-200/90 text-xs mt-0.5">Senior Hindi Educator</p>
                    <p className="text-primary-foreground/60 text-[11px] mt-0.5">Bal Vikas Public School, Kalayat</p>
                  </div>
                </div>

                {/* Narrative Quote & Vision */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 fill-secondary" />
                    <span>Principal's Message</span>
                  </div>
                  
                  <Quote className="w-10 h-10 text-secondary/50 mb-2 mx-auto md:mx-0" />
                  
                  <blockquote className="text-white text-lg sm:text-xl md:text-2xl leading-relaxed italic font-serif text-amber-100 font-semibold mb-4">
                    “Every child has unique potential. Our responsibility is to provide the right guidance, opportunities and environment so that every student can discover and achieve their potential.”
                  </blockquote>

                  <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
                    Under the visionary leadership of Sh. Ramphal Sharma, Bal Vikas Public School emphasizes holistic learning where intellectual curiosity meets unwavering discipline and moral uprightness.
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                    <a 
                      href="/principal-message#message-form" 
                      className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95 hover:scale-105"
                    >
                      Write Directly to Principal →
                    </a>
                    <a 
                      href="/principal-message" 
                      className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all"
                    >
                      View Full Principal's Desk
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>

          {/* Our Journey Timeline */}
          <ScrollReveal>
            <section className="mb-24 overflow-hidden rounded-[2rem] bg-[#07101f] p-6 text-white shadow-2xl md:p-10 lg:p-12">
              <div className="relative">
                <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative z-10 mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                  <div className="max-w-2xl">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="h-px w-10 bg-secondary" />
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">Since 2004</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-white md:text-5xl">Our Journey</h2>
                    <p className="mt-4 leading-relaxed text-white/65">
                      From a hopeful beginning to a thriving learning community — every chapter of BVPS has been shaped by children, families and teachers moving forward together.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
                    <div className="flex -space-x-2">
                      {[schoolBuildingImg, studentsImg, schoolEventImg].map((image, i) => (
                        <img
                          key={image}
                          src={image}
                          alt=""
                          className="h-10 w-10 rounded-full border-2 border-[#07101f] object-cover"
                          style={{ zIndex: 3 - i }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">One school, many stories</p>
                      <p className="text-xs text-white/50">Growing together in Kalayat</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid gap-7 lg:grid-cols-4 lg:gap-5">
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="pointer-events-none absolute bottom-7 left-5 top-5 w-px origin-top bg-gradient-to-b from-orange-400 via-fuchsia-400 to-teal-300 lg:bottom-auto lg:left-[12%] lg:right-[12%] lg:top-5 lg:h-px lg:w-auto lg:origin-left lg:bg-gradient-to-r"
                  />
                  {journeyMilestones.map((milestone, index) => (
                    <motion.article
                      key={milestone.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: index * 0.1, duration: 0.45 }}
                      whileHover={{ y: -8 }}
                      className="group relative ml-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-lg backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.12] lg:ml-0 lg:pt-14"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 0 0 rgba(249,115,22,0)', '0 0 0 8px rgba(249,115,22,0.12)', '0 0 0 0 rgba(249,115,22,0)'] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.2 }}
                        className={`absolute -left-10 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#07101f] bg-gradient-to-br ${milestone.color} text-white lg:left-1/2 lg:top-0 lg:-translate-x-1/2`}
                      >
                        <span className="h-2 w-2 rounded-full bg-white" />
                      </motion.div>
                      <div className="relative h-36 overflow-hidden bg-slate-900">
                        <img
                          src={milestone.image}
                          alt={milestone.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110 brightness-105 contrast-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#07101f] via-transparent to-transparent" />
                        <div className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${milestone.color} text-white shadow-lg`}>
                          <milestone.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="relative p-5">
                        <div className={`mb-2 inline-flex rounded-full bg-gradient-to-r ${milestone.color} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white`}>
                          {milestone.year}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-white">{milestone.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/60">{milestone.description}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* School Details */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border shadow-md">
              <h2 className="text-3xl font-serif font-bold text-black mb-2 text-center">School Overview</h2>
              <p className="text-center text-muted-foreground text-sm mb-10">Click any card to see a photo</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map((card, i) => (
                  <motion.button
                    key={card.title}
                    onClick={() => setSelected(card)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5, scale: 1.03 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.35 }}
                    className="flex flex-col items-center text-center p-6 bg-primary rounded-2xl cursor-pointer group hover:bg-primary/90 hover:shadow-xl transition-all w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors duration-300 rounded-2xl" />
                    <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform relative z-10">
                      <card.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-white relative z-10">{card.title}</h4>
                    <p className="text-primary-foreground/70 text-sm relative z-10 whitespace-pre-line">{card.desc}</p>
                    <span className="mt-3 text-secondary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity relative z-10">Tap to see photo →</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Modal */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={() => setSelected(null)}
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <img
                      src={selected.image}
                      alt={selected.title}
                      className="w-full h-72 object-cover"
                    />
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-2">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary shrink-0">
                        <selected.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-white font-serif font-bold text-xl">{selected.title}</h3>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-muted-foreground leading-relaxed text-sm">{selected.detail}</p>
                    <button
                      onClick={() => setSelected(null)}
                      className="mt-4 inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:text-secondary transition-colors"
                    >
                      Close <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </div>
  );
}

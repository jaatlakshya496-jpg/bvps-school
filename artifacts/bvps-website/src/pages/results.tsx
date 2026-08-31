import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Trophy, Medal, Star, Award, Filter, X } from 'lucide-react';
import heroSchoolImg from '@assets/bal-vikas-public-school_1784611430239.jpg';

// ── Football photos ──────────────────────────────────────────────────
import imgSweetAnishAryan    from '@assets/res-sweet-anish-aryan-u19-football.jpg';
import imgDakshayAnuSachmit  from '@assets/res-dakshay-anu-sachmit-u17-football.jpg';
import imgAryanDistrict      from '@/assets/result-football-tournament.png';
import imgDakshayDistrict    from '@/assets/result-football-tournament.png';
import imgAnishDistrict      from '@/assets/result-cricket-tournament.png';
// ── Cricket / General ────────────────────────────────────────────────
import imgVictory6           from '@assets/Victory_Earned,_Excellence_Achieved.Congratulations_District_C_1785563107940.jpg';
import imgDistrictGold       from '@assets/res-district-champions-gold.jpg';
// ── Karate photos ────────────────────────────────────────────────────
import imgKarate1            from '@assets/res-karate-district1.jpg';
import imgKarate2            from '@assets/res-karate-district2.jpg';
import imgKarate3            from '@assets/res-karate-district3.jpg';
import imgKarate4            from '@assets/res-karate-district4.jpg';
// ── Awards / Achievement photos ──────────────────────────────────────
import imgProudAchieve1      from '@/assets/res-proud-achieve1.jpg';
import imgProudAchieve2      from '@/assets/res-proud-achieve2.jpg';
import imgProudAchieve3      from '@/assets/res-proud-achieve3.jpg';
// ── Karate – Krish ───────────────────────────────────────────────────
import imgKrishKarateWinner  from '@/assets/res-krish-karate-winner.jpg';
// ── Athletics photos ─────────────────────────────────────────────────
import imgLavish100m         from '@/assets/result-group1.png';
import imgAryanHighJump      from '@/assets/result-group2.png';
import imgSachmitHurdle      from '@/assets/result-group3.png';
import imgDeveshDakshay      from '@/assets/result-hanshul-wrestling.png';
import imgPrinceAnu          from '@/assets/result-khushi-karate-gold.png';
import imgAthletics6         from '@assets/Victory_Earned,_Excellence_Achieved.Congratulations_District_C_1785563110488.jpg';
import imgAthletics7         from '@assets/Victory_Earned,_Excellence_Achieved.Congratulations_District_C_1785563118886.jpg';
import imgAthletics8         from '@assets/Victory_Earned,_Excellence_Achieved.Congratulations_District_C_1785563121697.jpg';
import imgAthletics9         from '@/assets/result-cricket-champion.png';

type SportFilter = 'All' | 'Football' | 'Cricket' | 'Karate' | 'Athletics' | 'Awards';
type Level       = 'Block' | 'District' | 'State';

interface Achievement {
  id: number;
  name: string;
  sport: SportFilter;
  sportLabel: string;
  title: string;
  score: string;
  position: string;        // short label e.g. "3rd", "1st", "Selected"
  positionBg: string;      // sport-position colour (tailwind bg)
  positionText: string;
  level: Level;
  img: string;
  detail: string;
}

/* ── Position colour helpers ─────────────────────────────────────────
   Football  → green tones
   Cricket   → blue tones
   Karate    → yellow/amber (gold)
   Athletics → orange tones                                           */

const SPORT_COLORS: Record<SportFilter, { banner: string; text: string; stripe: string }> = {
  All:       { banner: 'bg-gray-700',      text: 'text-white',          stripe: 'bg-gray-800' },
  Football:  { banner: 'bg-green-600',     text: 'text-white',          stripe: 'bg-green-700' },
  Cricket:   { banner: 'bg-blue-700',      text: 'text-white',          stripe: 'bg-blue-800' },
  Karate:    { banner: 'bg-yellow-400',    text: 'text-yellow-900',     stripe: 'bg-yellow-500' },
  Athletics: { banner: 'bg-orange-500',    text: 'text-white',          stripe: 'bg-orange-600' },
  Awards:    { banner: 'bg-purple-700',    text: 'text-white',          stripe: 'bg-purple-800' },
};

/* position badge: 1st→gold, 2nd→silver, 3rd→bronze, selected→indigo, winner→yellow */
const posBadge = (pos: string) => {
  if (pos === '1st' || pos === 'Champions' || pos === 'Winners')
    return { bg: 'bg-yellow-400', text: 'text-yellow-900' };
  if (pos === '2nd')   return { bg: 'bg-slate-300',  text: 'text-slate-800' };
  if (pos === '3rd')   return { bg: 'bg-orange-400', text: 'text-white' };
  return               { bg: 'bg-indigo-500',  text: 'text-white' };   // Selected / State Bound
};

const achievements: Achievement[] = [
  // ── FOOTBALL ────────────────────────────────────────────────────────
  {
    id: 1,  name: 'Sweet, Anish & Aryan', sport: 'Football', sportLabel: '⚽ Football',
    title: 'Block Level U-19 Football Tournament',
    score: '🏆 Winners — Block Level', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'Block', img: imgSweetAnishAryan,
    detail: 'Won the Block Level U-19 Football Tournament — BVPS Kalayat',
  },
  {
    id: 2,  name: 'Dakshay, Anu & Sachmit', sport: 'Football', sportLabel: '⚽ Football',
    title: 'Block Level U-17 Football Tournament',
    score: '🏆 Winners — Block Level', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'Block', img: imgDakshayAnuSachmit,
    detail: 'Won the Block Level U-17 Football Tournament — BVPS Kalayat',
  },
  {
    id: 3,  name: 'Aryan', sport: 'Football', sportLabel: '⚽ Football',
    title: 'Football — District Level',
    score: '🥉 3rd Position — District', position: '3rd',
    positionBg: 'bg-orange-400', positionText: 'text-white',
    level: 'District', img: imgAryanDistrict,
    detail: 'Football 3rd Position at District Level — Bal Vikas Public School, Kalayat',
  },
  {
    id: 4,  name: 'Dakshay', sport: 'Football', sportLabel: '⚽ Football',
    title: 'Football — District Level',
    score: '🥉 3rd Position — District', position: '3rd',
    positionBg: 'bg-orange-400', positionText: 'text-white',
    level: 'District', img: imgDakshayDistrict,
    detail: 'Football 3rd Position at District Level — Bal Vikas Public School, Kalayat',
  },
  // ── CRICKET ─────────────────────────────────────────────────────────
  {
    id: 5,  name: 'Anish', sport: 'Cricket', sportLabel: '🏏 Cricket & ⚽ Football',
    title: 'Double District Achievement',
    score: '🥉 3rd — Cricket + Football', position: '3rd',
    positionBg: 'bg-orange-400', positionText: 'text-white',
    level: 'District', img: imgAnishDistrict,
    detail: 'Cricket 3rd Position + Football 3rd Position at District Level',
  },
  {
    id: 6,  name: 'BVPS Champions', sport: 'Cricket', sportLabel: '🏆 Championship',
    title: 'District Level Achievement',
    score: '🥇 District Champions', position: 'Champions',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'District', img: imgVictory6,
    detail: 'Outstanding achievement at District Level — BVPS Kalayat',
  },
  {
    id: 7,  name: 'BVPS District Champions', sport: 'Cricket', sportLabel: '🏆 Championship',
    title: 'Congratulations District Champions',
    score: '🥇 District Champions', position: 'Champions',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'District', img: imgDistrictGold,
    detail: 'Best wishes for the State Level — BVPS Kalayat champions!',
  },
  // ── KARATE ──────────────────────────────────────────────────────────
  {
    id: 8,  name: 'BVPS Karate Team', sport: 'Karate', sportLabel: '🥋 Karate',
    title: 'District Champions & State Bound',
    score: '🥇 District Champions', position: 'Champions',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'State', img: imgKarate1,
    detail: 'Karate District Champions — Selected for State Level Competition',
  },
  {
    id: 9,  name: 'BVPS Karate Champions', sport: 'Karate', sportLabel: '🥋 Karate',
    title: 'District Champions & State Bound',
    score: '⭐ State Bound', position: 'Selected',
    positionBg: 'bg-indigo-500', positionText: 'text-white',
    level: 'State', img: imgKarate2,
    detail: 'Selected for State Level after winning District — Karate',
  },
  {
    id: 10, name: 'BVPS Karate Team', sport: 'Karate', sportLabel: '🥋 Karate',
    title: 'District Karate Championship',
    score: '🥇 District Champions', position: 'Champions',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'State', img: imgKarate3,
    detail: 'Karate District Champions — Representing BVPS Kalayat at State Level',
  },
  {
    id: 11, name: 'BVPS Karate Achievers', sport: 'Karate', sportLabel: '🥋 Karate',
    title: 'State Level Karate Selection',
    score: '⭐ State Selected', position: 'Selected',
    positionBg: 'bg-indigo-500', positionText: 'text-white',
    level: 'State', img: imgKarate4,
    detail: 'Selected for State Level Karate competition — BVPS Kalayat proud!',
  },
  // ── AWARDS / ACHIEVEMENTS ────────────────────────────────────────────
  {
    id: 21, name: 'BVPS Student', sport: 'Awards', sportLabel: '🏅 Awards',
    title: 'School Achievement — Trophy & Shield',
    score: '🏆 Winners', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'District', img: imgProudAchieve1,
    detail: 'Feeling extremely proud — BVPS Kalayat student honoured with trophy & shield for outstanding achievement.',
  },
  {
    id: 22, name: 'BVPS Student', sport: 'Awards', sportLabel: '🏅 Awards',
    title: 'School Achievement — Trophy & Shield',
    score: '🏆 Winners', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'District', img: imgProudAchieve2,
    detail: 'Feeling extremely proud — BVPS Kalayat student honoured with trophy & shield for outstanding achievement.',
  },
  {
    id: 23, name: 'BVPS Achievers', sport: 'Awards', sportLabel: '🏅 Awards',
    title: 'School Achievement Ceremony',
    score: '🏆 District Champions', position: 'Champions',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'District', img: imgProudAchieve3,
    detail: 'Feeling extremely proud — BVPS Kalayat team honoured at school achievement ceremony.',
  },
  // ── KARATE – Krish ───────────────────────────────────────────────────
  {
    id: 24, name: 'Krish s/o Sh. Sandeep Kumar', sport: 'Karate', sportLabel: '🥋 Karate',
    title: '2nd Open Karate Cash Prize Championship 2026-27',
    score: '🥇 1st — Boys Kumite Winner', position: '1st',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'District', img: imgKrishKarateWinner,
    detail: 'Many congratulations to Krish s/o Sh. Sandeep Kumar from Julan — Boys Kumite Winner at the 2nd Open Karate Cash Prize Championship 2026-27. Prize: ₹3,000.',
  },
  // ── ATHLETICS ───────────────────────────────────────────────────────
  {
    id: 12, name: 'Lavish', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'U-14 100M Race — Block Level',
    score: '🥉 3rd Position — Block', position: '3rd',
    positionBg: 'bg-orange-400', positionText: 'text-white',
    level: 'Block', img: imgLavish100m,
    detail: 'Lavish got 3rd Position in U-14 100M Race at Block Level',
  },
  {
    id: 13, name: 'Aryan', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'U-14 High Jump — District Level',
    score: '⭐ Selected — District', position: 'Selected',
    positionBg: 'bg-indigo-500', positionText: 'text-white',
    level: 'District', img: imgAryanHighJump,
    detail: 'Aryan selected for U-14 District Level High Jump',
  },
  {
    id: 14, name: 'Sachmit', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'U-19 100M Hurdle Race — District Level',
    score: '⭐ Selected — District', position: 'Selected',
    positionBg: 'bg-indigo-500', positionText: 'text-white',
    level: 'District', img: imgSachmitHurdle,
    detail: 'Sachmit selected for U-19 100M Hurdle Race at District Level',
  },
  {
    id: 15, name: 'Devesh & Dakshay', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'U-17 100M Hurdle Race — District Level',
    score: '⭐ Selected — District', position: 'Selected',
    positionBg: 'bg-indigo-500', positionText: 'text-white',
    level: 'District', img: imgDeveshDakshay,
    detail: 'Devesh & Dakshay selected for U-17 100M Hurdle Race at District Level',
  },
  {
    id: 16, name: 'Prince & Anu', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: '100M Race — Block Level',
    score: '🥉 3rd Position — Block', position: '3rd',
    positionBg: 'bg-orange-400', positionText: 'text-white',
    level: 'Block', img: imgPrinceAnu,
    detail: 'Prince & Anu got 3rd Position in 100M Race at Block Level',
  },
  {
    id: 17, name: 'BVPS Athletes', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'Athletics Achievement',
    score: '🏆 Block Level Achievement', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'Block', img: imgAthletics6,
    detail: 'BVPS students shine at Block Level Athletics — proud achievers!',
  },
  {
    id: 18, name: 'BVPS Athletes', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'Athletics Achievement',
    score: '🏆 Block Level Achievement', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'Block', img: imgAthletics7,
    detail: 'BVPS students shine at Block Level Athletics — proud achievers!',
  },
  {
    id: 19, name: 'BVPS Athletes', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'Athletics Achievement',
    score: '🏆 Block Level Achievement', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'Block', img: imgAthletics8,
    detail: 'BVPS students shine at Block Level Athletics — proud achievers!',
  },
  {
    id: 20, name: 'BVPS Athletes', sport: 'Athletics', sportLabel: '🏃 Athletics',
    title: 'Athletics Achievement',
    score: '🏆 Block Level Achievement', position: 'Winners',
    positionBg: 'bg-yellow-400', positionText: 'text-yellow-900',
    level: 'Block', img: imgAthletics9,
    detail: 'BVPS students shine at Block Level Athletics — proud achievers!',
  },
];

const sportFilters: SportFilter[] = ['All', 'Football', 'Cricket', 'Karate', 'Athletics', 'Awards'];
const levelFilters = ['All Levels', 'Block', 'District', 'State'];

const stats = [
  { value: '24', label: 'Achievements',     icon: Trophy },
  { value: '13', label: 'Gold / Winners',   icon: Medal  },
  { value: '7',  label: 'District Levels',  icon: Award  },
  { value: '4',  label: 'State Bound',      icon: Star   },
];

export default function Results() {
  const [sportFilter, setSportFilter] = useState<SportFilter>('All');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [selected, setSelected]       = useState<Achievement | null>(null);

  const filtered = achievements.filter(a => {
    const sportOk = sportFilter === 'All' || a.sport === sportFilter;
    const levelOk = levelFilter === 'All Levels' || a.level === levelFilter;
    return sportOk && levelOk;
  });

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-primary pt-24 pb-20 px-4 relative overflow-hidden">
        <img src={heroSchoolImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="absolute inset-0 pointer-events-none select-none">
          {[...Array(10)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full bg-secondary/10"
              style={{ width: 50 + i*25, height: 50 + i*25, left:`${8+i*9}%`, top:`${15+(i%4)*20}%` }}
              animate={{ y:[0,-12,0], opacity:[0.2,0.5,0.2] }}
              transition={{ duration:3+i*0.5, repeat:Infinity, delay:i*0.3 }}
            />
          ))}
        </div>
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-full px-4 py-1.5 text-sm font-bold mb-5">
              <Trophy className="w-4 h-4" /> Hall of Fame
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">
              Our <span className="text-secondary">Achievers</span>
            </h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Celebrating every champion of Bal Vikas Public School — Football, Cricket, Karate & Athletics.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <ScrollReveal key={label} delay={i*0.08}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <Icon className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <p className="text-3xl font-serif font-bold text-white">{value}</p>
                  <p className="text-primary-foreground/70 text-xs font-medium mt-0.5">{label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="sticky top-[68px] z-30 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2">
          {/* Sport */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {sportFilters.map(f => {
              const c = SPORT_COLORS[f];
              return (
                <button key={f} onClick={() => setSportFilter(f)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                    sportFilter === f ? `${c.banner} ${c.text} shadow-md scale-105` : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}>
                  {f === 'All' ? 'All Sports' : f}
                </button>
              );
            })}
          </div>
          {/* Level */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {levelFilters.map(f => (
              <button key={f} onClick={() => setLevelFilter(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  levelFilter === f ? 'bg-secondary text-primary shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}>
                {f === 'All Levels' ? 'All Levels' : `${f} Level`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <section className="py-16 flex-1"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sportFilter}-${levelFilter}`}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              transition={{ duration:0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((item, i) => {
                const sc   = SPORT_COLORS[item.sport];
                const pb   = posBadge(item.position);
                const medal =
                  item.position === 'Winners' || item.position === 'Champions' ? '🏆'
                  : item.position === '1st'   ? '🥇'
                  : item.position === '2nd'   ? '🥈'
                  : item.position === '3rd'   ? '🥉'
                  : '⭐';
                return (
                  <motion.div key={item.id}
                    initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => setSelected(item)}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-2xl"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {/* Full-bleed image */}
                    <img src={item.img} alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out" />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 group-hover:from-black/98 transition-all duration-500" />

                    {/* Sport-colored top accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${sc.banner} opacity-90`} />

                    {/* Sport-colored glow border on hover */}
                    <div className={`absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 ring-white/20 transition-all duration-300`} />

                    {/* Top-left: sport label pill */}
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/70 text-white border border-white/20 shadow-lg">
                        {item.sportLabel}
                      </span>
                    </div>

                    {/* Top-right: medal badge */}
                    <div className="absolute top-3 right-3">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                        transition={{ duration: 0.4 }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-2xl ${pb.bg} ${pb.text} ring-2 ring-white/60`}
                      >
                        {medal}
                      </motion.div>
                    </div>

                    {/* Bottom info panel */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                      {/* Level + sport */}
                      <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        {item.level} Level
                      </p>
                      {/* Title */}
                      <h3 className="text-white font-bold text-sm leading-snug mb-1">
                        {item.title}
                      </h3>
                      {/* Name */}
                      <p className="text-white/55 text-xs mb-3">{item.name}</p>
                      {/* Score pill */}
                      <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-full ${pb.bg} ${pb.text} shadow-lg`}>
                        {item.score}
                      </span>
                    </div>

                    {/* Hover: "Tap to view" indicator */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ pointerEvents: 'none' }}
                    >
                      <div className="bg-white/15 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl tracking-wide">
                        ✨ View Details
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-white/40">
              <Trophy className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold">No achievements found for this filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale:0.80, opacity:0, y:40 }}
              animate={{ scale:1, opacity:1, y:0 }}
              exit={{ scale:0.80, opacity:0, y:40 }}
              transition={{ type:'spring', stiffness:260, damping:22 }}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const sc = SPORT_COLORS[selected.sport];
                const pb = posBadge(selected.position);
                const medal =
                  selected.position === 'Winners' || selected.position === 'Champions' ? '🏆'
                  : selected.position === '1st'   ? '🥇'
                  : selected.position === '2nd'   ? '🥈'
                  : selected.position === '3rd'   ? '🥉'
                  : '⭐';
                return (
                  <div className="flex flex-col md:flex-row">
                    {/* Left: image */}
                    <div className="relative md:w-[55%] shrink-0" style={{ minHeight: 320 }}>
                      <img src={selected.img} alt={selected.title}
                        className="w-full h-full object-cover object-top brightness-105 contrast-105"
                        style={{ maxHeight: 520 }} />
                      {/* Gradient over image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30" />
                      {/* Close btn */}
                      <button onClick={() => setSelected(null)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors border border-white/20">
                        <X className="w-4 h-4" />
                      </button>
                      {/* Medal on image */}
                      <div className="absolute bottom-4 left-4">
                        <div className={`text-4xl drop-shadow-2xl`}>{medal}</div>
                      </div>
                    </div>

                    {/* Right: info */}
                    <div className="flex-1 flex flex-col"
                      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #0f0c29 100%)' }}>
                      {/* Sport header */}
                      <div className={`${sc.banner} px-6 py-3 flex items-center justify-between`}>
                        <span className={`font-bold text-sm ${sc.text}`}>{selected.sportLabel}</span>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${pb.bg} ${pb.text} shadow-md`}>
                          {selected.position}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-2">
                            {selected.level} Level Achievement
                          </p>
                          <h3 className="text-xl font-serif font-bold text-white mb-2 leading-snug">
                            {selected.title}
                          </h3>
                          <p className="text-secondary font-semibold text-base mb-3">{selected.name}</p>
                          <p className="text-white/60 text-sm leading-relaxed">{selected.detail}</p>
                        </div>

                        {/* Score badge */}
                        <div className="mt-6">
                          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm ${pb.bg} ${pb.text} shadow-xl`}>
                            {selected.score} 🎉
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA ── */}
      <section className="py-14 bg-primary text-center">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <Trophy className="w-10 h-10 text-secondary mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-3">Proud of Every Achiever</h3>
            <p className="text-primary-foreground/75 max-w-xl mx-auto text-sm">
              BVPS Kalayat celebrates every student who represents our school with dedication and excellence. You inspire us all!
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

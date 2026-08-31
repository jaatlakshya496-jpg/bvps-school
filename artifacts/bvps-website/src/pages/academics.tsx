import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { BookOpen, Clock, GraduationCap, FlaskConical, Calculator, Globe, Music, Dumbbell, Monitor } from 'lucide-react';

/* ── Timetable data ──────────────────────────────────── */

const periods = [
  { label: 'Period 1', time: '8:00 – 8:45 AM' },
  { label: 'Period 2', time: '8:45 – 9:30 AM' },
  { label: 'Break',    time: '9:30 – 9:45 AM', isBreak: true },
  { label: 'Period 3', time: '9:45 – 10:30 AM' },
  { label: 'Period 4', time: '10:30 – 11:15 AM' },
  { label: 'Lunch',    time: '11:15 – 11:45 AM', isBreak: true },
  { label: 'Period 5', time: '11:45 AM – 12:30 PM' },
  { label: 'Period 6', time: '12:30 – 1:15 PM' },
  { label: 'Period 7', time: '1:15 – 2:00 PM' },
  { label: 'Period 8', time: '2:00 – 3:00 PM' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type DaySchedule = Record<string, string[]>;

const timetables: Record<string, DaySchedule> = {
  'Primary (1–5)': {
    Monday:    ['Hindi',   'Mathematics', '—Break—', 'English',  'EVS',         '—Lunch—', 'Drawing',   'P.T.',      'GK',        'Moral Sci.'],
    Tuesday:   ['English', 'Hindi',       '—Break—', 'Mathematics','Drawing',   '—Lunch—', 'EVS',       'Computer',  'P.T.',      'Story Time'],
    Wednesday: ['Mathematics','English',  '—Break—', 'Hindi',    'GK',          '—Lunch—', 'Computer',  'EVS',       'Music',     'Activity'],
    Thursday:  ['EVS',     'Mathematics', '—Break—', 'English',  'Hindi',       '—Lunch—', 'Moral Sci.','Drawing',   'Music',     'P.T.'],
    Friday:    ['Hindi',   'English',     '—Break—', 'EVS',      'Mathematics', '—Lunch—', 'P.T.',      'Computer',  'GK',        'Drawing'],
    Saturday:  ['English', 'Hindi',       '—Break—', 'Mathematics','Music',     '—Lunch—', 'Activity',  'P.T.',      '—',         '—'],
  },
  'Middle (6–8)': {
    Monday:    ['Hindi',   'Mathematics', '—Break—', 'English',  'Science',     '—Lunch—', 'Soc. Sci.', 'Sanskrit',  'Computer',  'P.T.'],
    Tuesday:   ['English', 'Science',     '—Break—', 'Hindi',    'Mathematics', '—Lunch—', 'Computer',  'Soc. Sci.', 'Sanskrit',  'Drawing'],
    Wednesday: ['Mathematics','English',  '—Break—', 'Science',  'Hindi',       '—Lunch—', 'Sanskrit',  'Computer',  'P.T.',      'GK'],
    Thursday:  ['Science', 'Hindi',       '—Break—', 'Mathematics','English',   '—Lunch—', 'Soc. Sci.', 'Drawing',   'Sanskrit',  'Music'],
    Friday:    ['Soc. Sci.','Mathematics','—Break—', 'English',  'Hindi',       '—Lunch—', 'Science',   'Sanskrit',  'Computer',  'P.T.'],
    Saturday:  ['Hindi',   'English',     '—Break—', 'Mathematics','Science',   '—Lunch—', 'P.T.',      'GK',        '—',         '—'],
  },
  'Secondary (9–10)': {
    Monday:    ['Hindi',   'Mathematics', '—Break—', 'English',  'Science',     '—Lunch—', 'Soc. Sci.', 'Sanskrit',  'Computer',  'P.T.'],
    Tuesday:   ['English', 'Science',     '—Break—', 'Mathematics','Hindi',     '—Lunch—', 'Soc. Sci.', 'Computer',  'Sanskrit',  'P.T.'],
    Wednesday: ['Mathematics','Hindi',    '—Break—', 'English',  'Science',     '—Lunch—', 'Sanskrit',  'Soc. Sci.', 'Computer',  'Drawing'],
    Thursday:  ['Science', 'Mathematics', '—Break—', 'Hindi',    'English',     '—Lunch—', 'Computer',  'Soc. Sci.', 'Sanskrit',  'P.T.'],
    Friday:    ['Soc. Sci.','English',    '—Break—', 'Science',  'Mathematics', '—Lunch—', 'Hindi',     'Sanskrit',  'Computer',  'P.T.'],
    Saturday:  ['Hindi',   'Mathematics', '—Break—', 'English',  'Science',     '—Lunch—', 'P.T.',      'Drawing',   '—',         '—'],
  },
  'Sr. Secondary (11–12)': {
    Monday:    ['English', 'Physics',     '—Break—', 'Chemistry','Mathematics', '—Lunch—', 'Biology',   'Accounts',  'Economics', 'P.T.'],
    Tuesday:   ['Physics', 'English',     '—Break—', 'Biology',  'Accounts',    '—Lunch—', 'Mathematics','Chemistry','Economics', 'Computer'],
    Wednesday: ['Chemistry','Mathematics','—Break—', 'English',  'Physics',     '—Lunch—', 'Accounts',  'Biology',   'P.T.',      'Economics'],
    Thursday:  ['Biology', 'Chemistry',   '—Break—', 'Physics',  'English',     '—Lunch—', 'Economics', 'Mathematics','Accounts', 'Computer'],
    Friday:    ['Mathematics','English',  '—Break—', 'Chemistry','Biology',     '—Lunch—', 'Physics',   'Accounts',  'Economics', 'P.T.'],
    Saturday:  ['English', 'Physics',     '—Break—', 'Chemistry','Mathematics', '—Lunch—', 'P.T.',      'Lab Work',  '—',         '—'],
  },
};

const classGroups = Object.keys(timetables);

// Subject colour mapping
const subjectColor: Record<string, string> = {
  'Hindi':       'bg-rose-50 text-rose-700 border-rose-200',
  'English':     'bg-blue-50 text-blue-700 border-blue-200',
  'Mathematics': 'bg-amber-50 text-amber-700 border-amber-200',
  'Science':     'bg-green-50 text-green-700 border-green-200',
  'Physics':     'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Chemistry':   'bg-purple-50 text-purple-700 border-purple-200',
  'Biology':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Soc. Sci.':   'bg-orange-50 text-orange-700 border-orange-200',
  'Sanskrit':    'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Computer':    'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Drawing':     'bg-pink-50 text-pink-700 border-pink-200',
  'EVS':         'bg-lime-50 text-lime-700 border-lime-200',
  'GK':          'bg-teal-50 text-teal-700 border-teal-200',
  'P.T.':        'bg-red-50 text-red-700 border-red-200',
  'Music':       'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'Accounts':    'bg-sky-50 text-sky-700 border-sky-200',
  'Economics':   'bg-violet-50 text-violet-700 border-violet-200',
  'Lab Work':    'bg-green-50 text-green-700 border-green-200',
  'Moral Sci.':  'bg-orange-50 text-orange-700 border-orange-200',
  'Activity':    'bg-pink-50 text-pink-700 border-pink-200',
  'Story Time':  'bg-rose-50 text-rose-700 border-rose-200',
};

function cellClass(subject: string) {
  if (subject === '—Break—' || subject === '—Lunch—') return '';
  return subjectColor[subject] ?? 'bg-gray-50 text-gray-700 border-gray-200';
}

const highlights = [
  { icon: BookOpen,    label: 'Core Academics',   desc: 'Structured curriculum from Class 1 through 12 aligned with CBSE guidelines.' },
  { icon: FlaskConical,label: 'Science & Lab',    desc: 'Dedicated science labs for Physics, Chemistry, and Biology practical sessions.' },
  { icon: Calculator,  label: 'Mathematics',      desc: 'Strong focus on analytical thinking, problem solving, and board exam preparation.' },
  { icon: Monitor,     label: 'Computer Science', desc: 'Regular computer periods with internet access and hands-on coding basics.' },
  { icon: Globe,       label: 'Social Science',   desc: 'Geography, History, Civics and Economics taught with maps and case studies.' },
  { icon: Dumbbell,    label: 'Physical Education',desc: 'Daily PT periods and sports activities for physical fitness and teamwork.' },
  { icon: Music,       label: 'Arts & Music',     desc: 'Drawing, painting, and music integrated into the weekly schedule.' },
  { icon: GraduationCap,label: 'Moral Science',  desc: 'Value education and moral science sessions to build character and discipline.' },
];

export default function Academics() {
  const [activeGroup, setActiveGroup] = useState(classGroups[0]);
  const schedule = timetables[activeGroup];

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="bg-primary pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Academics</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              A structured, well-rounded curriculum designed to nurture every student from Class 1 to 12.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* ── Subject Highlights ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-10">
          <ScrollReveal>
            <div className="mb-10">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">What We Teach</span>
              <h2 className="text-3xl font-serif font-bold text-black mt-1">Academic Subjects</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {highlights.map((h, i) => (
              <ScrollReveal key={h.label} delay={i * 0.07}>
                <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-3 h-full hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <h.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">{h.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{h.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timetable ── */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-secondary" />
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Weekly Schedule</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-black mb-2">Class Timetable</h2>
            <p className="text-muted-foreground mb-8 max-w-xl">School hours: Mon–Sat, 8:00 AM – 3:00 PM. Select your class group to view the weekly schedule.</p>
          </ScrollReveal>

          {/* Tab selector */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-2 mb-8">
              {classGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                    activeGroup === g
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Timetable grid — scrollable on small screens */}
          <ScrollReveal>
            <div className="overflow-x-auto rounded-2xl border border-border shadow-sm bg-white">
              <table className="min-w-[900px] w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="text-left px-4 py-3 font-semibold w-36 border-r border-white/20">Period / Time</th>
                    {days.map((d) => (
                      <th key={d} className="px-3 py-3 font-semibold text-center border-r border-white/20 last:border-r-0">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p, pi) => {
                    const isBreak = p.isBreak;
                    return (
                      <tr
                        key={p.label}
                        className={`border-b border-border/40 last:border-b-0 ${isBreak ? 'bg-primary/5' : pi % 2 === 0 ? 'bg-white' : 'bg-muted/20'}`}
                      >
                        {/* Period label */}
                        <td className="px-4 py-3 border-r border-border/40">
                          <p className={`font-bold text-xs ${isBreak ? 'text-secondary' : 'text-primary'}`}>{p.label}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{p.time}</p>
                        </td>
                        {/* Subject cells */}
                        {days.map((d) => {
                          const subject = schedule[d]?.[pi] ?? '—';
                          if (isBreak) {
                            return (
                              <td key={d} colSpan={1} className="px-3 py-2 text-center border-r border-border/40 last:border-r-0">
                                <span className="text-xs font-semibold text-secondary/80 uppercase tracking-wide">{subject}</span>
                              </td>
                            );
                          }
                          const cc = cellClass(subject);
                          return (
                            <td key={d} className="px-2 py-2 border-r border-border/40 last:border-r-0">
                              {subject !== '—' ? (
                                <span className={`inline-block w-full text-center px-2 py-1.5 rounded-lg border text-xs font-semibold ${cc}`}>
                                  {subject}
                                </span>
                              ) : (
                                <span className="block text-center text-muted-foreground/30 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground font-semibold mr-1">Legend:</span>
              {Object.entries(subjectColor).slice(0, 10).map(([sub, cls]) => (
                <span key={sub} className={`text-xs px-2 py-1 rounded-md border font-medium ${cls}`}>{sub}</span>
              ))}
              <span className="text-xs text-muted-foreground italic">and more…</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── School Timings card ── */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <ScrollReveal>
            <div className="bg-primary rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center shadow-xl">
              <div className="shrink-0 w-20 h-20 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center">
                <Clock className="w-10 h-10 text-secondary" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-serif font-bold text-white mb-3">School Timings</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary font-semibold">Mon – Fri</p>
                    <p className="text-primary-foreground/80">8:00 AM – 3:00 PM</p>
                  </div>
                  <div>
                    <p className="text-secondary font-semibold">Saturday</p>
                    <p className="text-primary-foreground/80">8:00 AM – 1:00 PM</p>
                  </div>
                  <div>
                    <p className="text-secondary font-semibold">Sunday</p>
                    <p className="text-primary-foreground/80">Holiday</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

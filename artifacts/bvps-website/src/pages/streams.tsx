import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { GraduationCap, ArrowLeft, Phone, ArrowRight, BookOpen } from 'lucide-react';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';

const classSections = [
  {
    group: 'Primary Section',
    classes: 'Class 1 – 5',
    color: 'bg-sky-600',
    lightBg: 'bg-sky-50 border-sky-200',
    desc: 'Foundation years — language, numbers, and curiosity.',
    subjects: [
      'Hindi',
      'English',
      'Mathematics',
      'Environmental Studies (EVS)',
      'Drawing & Art',
      'Physical Education (Games)',
      'Moral Science / Value Education',
    ],
    note: 'No stream division. All subjects are compulsory.',
  },
  {
    group: 'Middle Section',
    classes: 'Class 6 – 8',
    color: 'bg-teal-600',
    lightBg: 'bg-teal-50 border-teal-200',
    desc: 'Building core knowledge across all disciplines.',
    subjects: [
      'Hindi',
      'English',
      'Mathematics',
      'Science',
      'Social Science (History, Geography, Civics)',
      'Sanskrit / Computer',
      'Drawing & Art',
      'Physical Education',
    ],
    note: 'No stream division. All subjects are compulsory.',
  },
  {
    group: 'Secondary Section',
    classes: 'Class 9 – 10',
    color: 'bg-violet-600',
    lightBg: 'bg-violet-50 border-violet-200',
    desc: 'Board preparation with comprehensive subject coverage.',
    subjects: [
      'Hindi',
      'English',
      'Mathematics',
      'Science (Physics, Chemistry, Biology)',
      'Social Science (History, Geography, Economics, Political Science)',
      'Sanskrit / Computer Science (optional)',
      'Physical Education',
    ],
    note: 'All subjects are as per HBSE curriculum. No stream division at this level.',
  },
  {
    group: 'Senior Secondary — Non-Medical (PCM)',
    classes: 'Class 11 – 12',
    color: 'bg-blue-600',
    lightBg: 'bg-blue-50 border-blue-200',
    desc: 'Best for engineering, architecture, or technology careers.',
    subjects: [
      'English Core (compulsory)',
      'Physics (compulsory)',
      'Chemistry (compulsory)',
      'Mathematics (compulsory)',
      'Optional: Fine Arts / Physical Education / Artificial Intelligence',
    ],
    note: 'Choose one optional subject.',
  },
  {
    group: 'Senior Secondary — Medical (PCB)',
    classes: 'Class 11 – 12',
    color: 'bg-green-600',
    lightBg: 'bg-green-50 border-green-200',
    desc: 'Ideal for medicine, pharmacy, or life sciences.',
    subjects: [
      'English Core (compulsory)',
      'Physics (compulsory)',
      'Chemistry (compulsory)',
      'Biology (compulsory)',
      'Optional: Fine Arts / Physical Education / Artificial Intelligence',
    ],
    note: 'Choose one optional subject.',
  },
  {
    group: 'Senior Secondary — Commerce',
    classes: 'Class 11 – 12',
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50 border-orange-200',
    desc: 'For students interested in business, finance, or management.',
    subjects: [
      'English Core (compulsory)',
      'Accountancy (compulsory)',
      'Business Studies (compulsory)',
      'Economics (compulsory)',
      '5th Subject: Mathematics / Informatics Practices',
      '6th Subject: Fine Arts / Physical Education',
    ],
    note: 'Choose one 5th subject and one 6th subject.',
  },
  {
    group: 'Senior Secondary — Humanities / Arts',
    classes: 'Class 11 – 12',
    color: 'bg-purple-600',
    lightBg: 'bg-purple-50 border-purple-200',
    desc: 'For students interested in social sciences, law, or civil services.',
    subjects: [
      'English Core (compulsory)',
      'Hindi (optional)',
      'Political Science (optional)',
      'History (optional)',
      'Geography (optional)',
      'Economics (optional)',
      'Mathematics (optional)',
    ],
    note: 'Choose any 4 compulsory + 1 additional subject from the optional list.',
  },
];

export default function Streams() {
  return (
    <div className="flex flex-col">
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Admissions</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">Streams & Curriculum</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Subject breakdown for every class — Primary, Middle, Secondary, and Senior Secondary.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <Link href="/" className="inline-flex items-center gap-2 mt-6 text-primary-foreground/70 hover:text-secondary transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {classSections.map((section, i) => (
              <ScrollReveal key={section.group} delay={i * 0.06}>
                <div className={`bg-white rounded-2xl border ${section.lightBg} shadow-sm overflow-hidden h-full flex flex-col`}>
                  <div className={`${section.color} px-6 py-5 flex items-start gap-3`}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      {['Class 1 – 5', 'Class 6 – 8', 'Class 9 – 10'].includes(section.classes)
                        ? <BookOpen className="w-5 h-5 text-white" />
                        : <GraduationCap className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">{section.classes}</p>
                      <h3 className="text-base font-serif font-bold text-white leading-snug">{section.group}</h3>
                      <p className="text-white/70 text-xs mt-1">{section.desc}</p>
                    </div>
                  </div>
                  <div className="divide-y divide-border flex-1">
                    <div className="px-6 py-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Subjects</p>
                      <ul className="space-y-1.5">
                        {section.subjects.map(s => (
                          <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-6 py-3 bg-muted/30">
                      <p className="text-xs text-muted-foreground italic">{section.note}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="bg-primary text-white rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
              <div>
                <h3 className="text-xl font-serif font-bold mb-1">Not sure which stream to choose?</h3>
                <p className="text-primary-foreground/80 text-sm">Call us — our counselors will help guide your decision.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <a href="tel:+919812550200" className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-6 h-11 text-sm transition-colors whitespace-nowrap">
                  <Phone className="w-4 h-4" /> Call Us
                </a>
                <Link href="/application" className="inline-flex items-center gap-2 border border-white text-white hover:bg-white hover:text-primary font-bold rounded-full px-6 h-11 text-sm bg-white/10 transition-colors whitespace-nowrap">
                  Apply <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </div>
  );
}

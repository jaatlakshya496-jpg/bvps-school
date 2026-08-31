import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  IndianRupee, Send, MessageSquare, Clock, ClipboardList,
  GraduationCap, Quote, CheckCircle2, Star, ArrowRight,
  Phone,
} from 'lucide-react';
import principalImg from '@assets/principal-ramphal-sharma.png';
import heroImg from '@assets/generated_images/hero-school.jpg';
import { getFeedbacks, saveFeedback, type FeedbackEntry, roleLabels } from '@/lib/feedback-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-secondary text-secondary' : 'text-muted-foreground/20'}`} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}>
          <Star className={`w-6 h-6 transition-colors ${s <= (hovered || value) ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

const admissionsPages = [
  {
    icon: IndianRupee,
    title: 'Fee Structure',
    desc: 'Class-wise admission fees, monthly tuition, and payment options.',
    path: '/fee-structure',
    color: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: ClipboardList,
    title: 'Enrollment',
    desc: 'Final enrollment checklist and fee payment to complete admission.',
    path: '/enrollment',
    color: 'bg-rose-50 border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Quote,
    title: "Principal's Desk",
    desc: 'A personal welcome and direct contact with Principal Sh. Ramphal Sharma.',
    path: '/principal-message',
    color: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'Interview & Interaction',
    desc: 'A friendly interaction session — what to expect and how to prepare.',
    path: '/interview',
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    icon: GraduationCap,
    title: 'Streams (Class 11–12)',
    desc: 'Explore Non-Medical, Medical, Commerce, and Arts / Humanities streams.',
    path: '/streams',
    color: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Send,
    title: 'Application Submission',
    desc: 'Fill the online application form to register your admission enquiry.',
    path: '/application',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Clock,
    title: 'School Timing',
    desc: 'School hours, office timings, assembly schedule, and location.',
    path: '/school-timing',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100 text-orange-600',
  },
];

export default function Admissions() {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbName, setFbName] = useState('');
  const [fbRole, setFbRole] = useState<FeedbackEntry['role'] | ''>('');
  const [fbRating, setFbRating] = useState(0);
  const [fbMessage, setFbMessage] = useState('');
  const [fbErrors, setFbErrors] = useState<Record<string, string>>({});

  useEffect(() => { setFeedbacks(getFeedbacks()); }, []);

  function handleFbSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fbName.trim() || fbName.length < 2) errs.name = 'Name is required';
    if (!fbRole) errs.role = 'Please select your role';
    if (fbRating === 0) errs.rating = 'Please select a rating';
    if (!fbMessage.trim() || fbMessage.length < 5) errs.message = 'Please write your feedback';
    setFbErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const entry = saveFeedback({ name: fbName, role: fbRole as FeedbackEntry['role'], category: 'overall', rating: fbRating, feedback: fbMessage });
    setFeedbacks([entry, ...feedbacks]);
    setFbSubmitted(true);
    setFbName(''); setFbRole(''); setFbRating(0); setFbMessage('');
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Admissions 2025–26</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Join the BVPS family. Admissions open for Classes 1 to 12.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Overview cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">

          <ScrollReveal>
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-sm mb-16">
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-xl text-primary font-medium border border-primary/10 text-sm mb-4">
                <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Admissions open for Classes 1 to 12 — Session 2025–26
              </div>
              <h2 className="text-3xl font-serif font-bold text-black mb-3">Start Your Child's Journey With Us</h2>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                Bal Vikas Public School welcomes students from all backgrounds. Browse each section below for detailed information about fees, the application process, school timings, and more.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {admissionsPages.map((page, i) => (
              <ScrollReveal key={page.path} delay={i * 0.06}>
                <Link href={page.path}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl border ${page.color} p-6 cursor-pointer group h-full flex flex-col`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${page.iconBg} group-hover:scale-110 transition-transform`}>
                      <page.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-black text-lg mb-2">{page.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{page.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-secondary transition-colors">
                      View Details <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {/* Have Questions */}
          <ScrollReveal>
            <div className="bg-primary text-white rounded-3xl p-10 shadow-xl max-w-3xl mx-auto text-center mb-0">
              <h3 className="text-2xl font-serif font-bold mb-3">Have Questions?</h3>
              <p className="text-primary-foreground/80 mb-8">Our admission counselors are here to help you through every step.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+919812550200" className="inline-flex w-full sm:w-auto items-center justify-center h-12 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-8 gap-2 transition-colors">
                  <Phone className="w-5 h-5" /> Call +91 98125 50200
                </a>
                <Link href="/contact" className="inline-flex w-full sm:w-auto items-center justify-center h-12 border border-white text-white hover:bg-white hover:text-primary font-bold rounded-full px-8 bg-white/10 transition-colors gap-2">
                  Message Us <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Feedback */}
      <section className="py-16 bg-muted/40 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-10">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <h3 className="text-xl font-serif font-bold text-black">Share Your Feedback</h3>
              </div>
              {fbSubmitted ? (
                <div className="flex items-center gap-3 py-4 text-green-700">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-semibold">Thank you for your feedback!</p>
                    <button className="text-sm underline mt-0.5 text-green-600" onClick={() => setFbSubmitted(false)}>Submit another</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFbSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input placeholder="Your name" value={fbName} onChange={e => setFbName(e.target.value)} />
                      {fbErrors.name && <p className="text-xs text-destructive mt-1">{fbErrors.name}</p>}
                    </div>
                    <div>
                      <Select value={fbRole} onValueChange={v => setFbRole(v as FeedbackEntry['role'])}>
                        <SelectTrigger><SelectValue placeholder="You are a…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Parent / Guardian</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="alumni">Alumni</SelectItem>
                          <SelectItem value="visitor">Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                      {fbErrors.role && <p className="text-xs text-destructive mt-1">{fbErrors.role}</p>}
                    </div>
                  </div>
                  <div>
                    <StarPicker value={fbRating} onChange={setFbRating} />
                    {fbErrors.rating && <p className="text-xs text-destructive mt-1">{fbErrors.rating}</p>}
                  </div>
                  <div>
                    <Textarea placeholder="Write your feedback here…" value={fbMessage} onChange={e => setFbMessage(e.target.value)} className="min-h-[90px] resize-none" />
                    {fbErrors.message && <p className="text-xs text-destructive mt-1">{fbErrors.message}</p>}
                  </div>
                  <Button type="submit" className="bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-lg px-8">
                    Submit Feedback
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {feedbacks.length > 0 && (
            <>
              <ScrollReveal>
                <h4 className="text-lg font-serif font-bold text-black mb-5 flex items-center gap-2">
                  <Star className="w-4 h-4 text-secondary fill-secondary" /> What People Say
                </h4>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 gap-4">
                {feedbacks.map((entry, idx) => (
                  <ScrollReveal key={entry.id} delay={idx * 0.05}>
                    <div className="bg-white rounded-xl p-5 border border-border shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-primary">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{roleLabels[entry.role]}</p>
                        </div>
                        <StarDisplay rating={entry.rating} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">"{entry.feedback}"</p>
                      <p className="text-xs text-muted-foreground/50">
                        {new Date(entry.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

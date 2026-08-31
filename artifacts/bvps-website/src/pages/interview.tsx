import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { Building2, PhoneCall, CheckCircle2, Info, Video, ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import heroImg from '@assets/principal-ramphal-sharma.png';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const timeSlots = ['9:00 AM – 10:00 AM', '10:00 AM – 11:00 AM', '11:00 AM – 12:00 PM', '12:00 PM – 1:00 PM'];

export default function Interview() {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewSlot, setInterviewSlot] = useState('');
  const [interviewMode, setInterviewMode] = useState('');
  const [scheduled, setScheduled] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="bg-primary pt-24 pb-0 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8">

            {/* Left — text */}
            <div className="flex-1 pb-16 text-center md:text-left">
              <ScrollReveal>
                <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Admissions</span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">Interview &amp; Interaction</h1>
                <div className="w-24 h-1.5 bg-secondary rounded-full md:mx-0 mx-auto" />
                <p className="mt-6 text-primary-foreground/80 text-lg max-w-xl">
                  A brief, friendly interaction with the student and parents — not a test.
                </p>
              </ScrollReveal>
              <ScrollReveal>
                <Link href="/" className="inline-flex items-center gap-2 mt-6 text-primary-foreground/70 hover:text-secondary transition-colors text-sm font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
              </ScrollReveal>
            </div>

            {/* Right — principal photo */}
            <div className="shrink-0 flex flex-col items-center pb-0">
              <div className="relative">
                {/* Glow ring behind photo */}
                <div className="absolute -inset-3 rounded-t-3xl bg-secondary/20 blur-xl" />
                <img
                  src={heroImg}
                  alt="Sh. Ramphal Sharma — Principal"
                  className="relative w-64 md:w-80 rounded-t-3xl object-cover object-top shadow-2xl border-4 border-secondary/40"
                  style={{ maxHeight: 380 }}
                />
                {/* Name badge at bottom of photo */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-none px-4 py-4">
                  <p className="text-white font-serif font-bold text-base leading-tight">Sh. Ramphal Sharma</p>
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wider">Principal &amp; Founder</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-10">

          <div className="grid md:grid-cols-2 gap-6">
            {/* What to expect */}
            <ScrollReveal delay={0.05}>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-bold text-black text-lg">What to Expect</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    ['Duration',  '15–20 minutes, relaxed conversation'],
                    ['Who attends', 'Student + at least one parent/guardian'],
                    ['Language', 'Hindi or English — your comfort'],
                    ['Purpose', "Understanding the child's learning needs"],
                    ['No exam', 'Not a test — just a friendly interaction'],
                  ].map(([key, val]) => (
                    <li key={key} className="flex gap-3 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                      <span className="font-bold text-black w-28 shrink-0">{key}</span>
                      <span className="text-muted-foreground">{val}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Interaction modes */}
            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Video className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-bold text-black text-lg">Interaction Modes</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Building2, mode: 'In-Person (Recommended)', detail: 'Visit school between 9 AM – 12 PM, Mon–Sat. Best to call ahead.' },
                    { icon: PhoneCall, mode: 'Phone Call', detail: 'Our counselor will call on your mobile. Provide a preferred time in the application form.' },
                  ].map(({ icon: Icon, mode, detail }) => (
                    <div key={mode} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold text-black text-sm">{mode}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Schedule interview */}
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg">Schedule Your Interview</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose your preferred date, time and interaction mode. Our admissions team will confirm it with you.
                  </p>
                </div>
              </div>

              {scheduled ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-green-800">Interview preference saved</p>
                    <p className="text-sm text-green-700 mt-1">
                      {interviewDate} · {interviewSlot} · {interviewMode === 'in-person' ? 'In-Person at School' : 'Phone Call'}
                    </p>
                    <p className="text-xs text-green-700 mt-2">The school team will contact you to confirm the final slot.</p>
                    <button
                      type="button"
                      onClick={() => setScheduled(false)}
                      className="mt-3 text-xs font-bold text-green-800 underline underline-offset-2"
                    >
                      Change preference
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Preferred Date</label>
                      <Input
                        type="date"
                        value={interviewDate}
                        onChange={e => setInterviewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Preferred Time</label>
                      <Select value={interviewSlot} onValueChange={setInterviewSlot}>
                        <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Mode</label>
                      <Select value={interviewMode} onValueChange={setInterviewMode}>
                        <SelectTrigger><SelectValue placeholder="Choose mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">In-Person (School Visit)</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!interviewDate || !interviewSlot || !interviewMode}
                    onClick={() => setScheduled(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-6 h-11 text-sm font-bold text-primary transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Interview Preference
                  </button>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                for: 'Student',
                bg: 'bg-primary',
                textColor: 'text-white',
                subColor: 'text-primary-foreground/80',
                dotColor: 'bg-secondary',
                iconColor: 'text-secondary',
                tips: ['Dress in school uniform: white shirt, black pants, black shoes', 'Be polite and confident', 'Know your previous class subjects', 'Carry your report card'],
              },
              {
                for: 'Parents',
                bg: 'bg-secondary/10 border border-secondary/30',
                textColor: 'text-black',
                subColor: 'text-muted-foreground',
                dotColor: 'bg-primary',
                iconColor: 'text-primary',
                tips: ["Bring all required documents", "Be ready to discuss child's strengths", 'Ask about curriculum and fee schedule', 'Note the school rules and calendar'],
              },
            ].map((t, i) => (
              <ScrollReveal key={t.for} delay={i * 0.08}>
                <div className={`rounded-2xl p-6 ${t.bg}`}>
                  <h4 className={`font-bold mb-4 flex items-center gap-2 text-base ${t.textColor}`}>
                    <CheckCircle2 className={`w-4 h-4 ${t.iconColor}`} />
                    Tips for {t.for}
                  </h4>
                  <ul className="space-y-3">
                    {t.tips.map(tip => (
                      <li key={tip} className={`text-sm flex items-start gap-2 ${t.subColor}`}>
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${t.dotColor}`} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal>
            <div className="bg-primary text-white rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-serif font-bold mb-1">Ready to schedule your interaction?</h3>
                <p className="text-primary-foreground/80 text-sm">Choose your preferred date and mode above, then submit the application separately.</p>
              </div>
              <Link href="/application" className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-8 h-11 text-sm transition-colors whitespace-nowrap">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </div>
  );
}

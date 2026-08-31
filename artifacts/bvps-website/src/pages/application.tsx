import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import {
  Send, CheckCircle2, Phone, ArrowLeft,
  User, Briefcase,
} from 'lucide-react';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';
import { saveApplication } from '@/lib/enquiry-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Application() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    studentName: '', dob: '', gender: '', classApplying: '', stream: '',
    parentName: '', relation: '', mobile: '', email: '',
    address: '', previousSchool: '', message: '',
  });

  const showStream = form.classApplying === '11' || form.classApplying === '12';

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.studentName.trim()) e.studentName = 'Student name required';
    if (!form.dob) e.dob = 'Date of birth required';
    if (!form.gender) e.gender = 'Select gender';
    if (!form.classApplying) e.classApplying = 'Select class';
    if (!form.parentName.trim()) e.parentName = 'Parent name required';
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, ''))) e.mobile = 'Valid 10-digit mobile required';
    if (!form.address.trim()) e.address = 'Address required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    saveApplication({ ...form });
    setSubmitted(true);
    setForm({ studentName: '', dob: '', gender: '', classApplying: '', stream: '', parentName: '', relation: '', mobile: '', email: '', address: '', previousSchool: '', message: '' });
  }

  return (
    <div className="flex flex-col">
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Admissions</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">Application Submission</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Fill this form to register your admission enquiry for session 2025–26.
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
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-border shadow-lg p-8 md:p-10">
              {submitted ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-black mb-3">Application Submitted!</h3>
                  <p className="text-muted-foreground mb-2 max-w-md mx-auto">Thank you! Your admission enquiry has been recorded. Our team will contact you within <strong>1–2 working days</strong> on the mobile number provided.</p>
                  <p className="text-sm text-muted-foreground mb-6">For urgent queries: <a href="tel:+919812550200" className="text-primary font-semibold">+91 98125 50200</a></p>
                  <button onClick={() => setSubmitted(false)} className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-secondary transition-colors border border-primary/20 rounded-full px-6 py-2.5">
                    Submit Another Application
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Student Details */}
                  <div>
                    <h4 className="font-bold text-black mb-4 flex items-center gap-2 text-base">
                      <User className="w-4 h-4 text-secondary" /> Student Details
                    </h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Student Full Name *</label>
                        <Input placeholder="e.g. Rahul Sharma" value={form.studentName} onChange={e => set('studentName', e.target.value)} />
                        {errors.studentName && <p className="text-xs text-destructive mt-1">{errors.studentName}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Date of Birth *</label>
                        <Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                        {errors.dob && <p className="text-xs text-destructive mt-1">{errors.dob}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Gender *</label>
                        <Select value={form.gender} onValueChange={v => set('gender', v)}>
                          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Class Applying For *</label>
                        <Select value={form.classApplying} onValueChange={v => set('classApplying', v)}>
                          <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(c => (
                              <SelectItem key={c} value={String(c)}>Class {c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.classApplying && <p className="text-xs text-destructive mt-1">{errors.classApplying}</p>}
                      </div>
                      {showStream && (
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Stream (Class 11–12)</label>
                          <Select value={form.stream} onValueChange={v => set('stream', v)}>
                            <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="non-medical">Non-Medical (PCM)</SelectItem>
                              <SelectItem value="medical">Medical (PCB)</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="humanities">Humanities / Arts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Previous School Name (if any)</label>
                        <Input placeholder="e.g. Govt. Senior Secondary School, Kalayat" value={form.previousSchool} onChange={e => set('previousSchool', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Parent Details */}
                  <div>
                    <h4 className="font-bold text-black mb-4 flex items-center gap-2 text-base">
                      <Briefcase className="w-4 h-4 text-secondary" /> Parent / Guardian Details
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Parent / Guardian Name *</label>
                        <Input placeholder="e.g. Suresh Kumar Sharma" value={form.parentName} onChange={e => set('parentName', e.target.value)} />
                        {errors.parentName && <p className="text-xs text-destructive mt-1">{errors.parentName}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Relation to Student</label>
                        <Select value={form.relation} onValueChange={v => set('relation', v)}>
                          <SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Mobile Number *</label>
                        <Input type="tel" placeholder="10-digit mobile" maxLength={10} value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                        {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email (optional)</label>
                        <Input type="email" placeholder="yourname@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Residential Address *</label>
                        <Textarea placeholder="House No., Street, Village/Town, District, Pincode" value={form.address} onChange={e => set('address', e.target.value)} className="resize-none min-h-[80px]" />
                        {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Additional Message / Special Note</label>
                    <Textarea placeholder="Any specific question, requirement, or information you'd like to share…" value={form.message} onChange={e => set('message', e.target.value)} className="resize-none min-h-[80px]" />
                  </div>

                  <Button type="submit" className="bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-xl px-10 h-12 text-base gap-2 w-full sm:w-auto">
                    <Send className="w-4 h-4" /> Submit Application
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

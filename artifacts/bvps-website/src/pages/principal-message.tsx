import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { 
  Quote, Phone, ArrowLeft, ArrowRight, GraduationCap, Send, 
  CheckCircle2, MessageSquare, Mail, User, Sparkles, Clock, 
  Shield, BookOpen, Award, HeartHandshake, Compass, Star
} from 'lucide-react';
import principalImg from '@assets/principal-ramphal-sharma.png';
import { savePrincipalMessage, type PrincipalDirectMessage } from '@/lib/principal-message-store';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/language-context';

export default function PrincipalMessage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Message Form State
  const [senderName, setSenderName] = useState('');
  const [senderRole, setSenderRole] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Admission Guidance');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<PrincipalDirectMessage | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !phone.trim() || !message.trim()) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please provide your name, phone number, and message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const receipt = savePrincipalMessage({
        senderName: senderName.trim(),
        senderRole,
        phone: phone.trim(),
        email: email.trim() || undefined,
        category,
        subject: subject.trim() || `${category} - Query for Principal`,
        message: message.trim(),
      });

      setSubmittedReceipt(receipt);
      setIsSubmitting(false);
      toast({
        title: 'Message Sent Successfully!',
        description: `Your message has been delivered to Principal Sh. Ramphal Sharma's desk (Ref: ${receipt.id}).`,
      });
    }, 400);
  };

  const handleWhatsAppSend = () => {
    const text = `*Message for Principal Sh. Ramphal Sharma (BVPS Kalayat)*%0A%0A*From:* ${encodeURIComponent(senderName || 'Parent / Visitor')} (${encodeURIComponent(senderRole)})%0A*Phone:* ${encodeURIComponent(phone || 'N/A')}%0A*Topic:* ${encodeURIComponent(category)}%0A*Subject:* ${encodeURIComponent(subject || 'Inquiry')}%0A%0A*Message:*%0A${encodeURIComponent(message || 'Hello Principal Sir, I would like to get in touch regarding BVPS.')}`;
    window.open(`https://wa.me/919812550200?text=${text}`, '_blank');
  };

  const resetForm = () => {
    setSenderName('');
    setSenderRole('Parent');
    setPhone('');
    setEmail('');
    setCategory('Admission Guidance');
    setSubject('');
    setMessage('');
    setSubmittedReceipt(null);
  };

  return (
    <div className="flex flex-col">
      {/* ── HEADER BANNER ── */}
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
              <Star className="w-3.5 h-3.5 fill-secondary" /> {t('principal.badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3 mt-1">
              {t('principal.title')}
            </h1>
            <p className="text-secondary font-medium text-base sm:text-lg max-w-2xl mx-auto">
              {t('principal.subtitle')}
            </p>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full mt-4" />
          </ScrollReveal>
          
          <ScrollReveal>
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <Link href="/" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> {t('nav.home', 'Home')}
              </Link>
              <span className="text-primary-foreground/30">•</span>
              <a href="#message-form" className="inline-flex items-center gap-1.5 bg-secondary text-primary font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-secondary/90 transition-all shadow-md active:scale-95">
                <MessageSquare className="w-3.5 h-3.5" /> {t('home.messagePrincipalBtn', 'Message Principal Direct')}
              </a>
              <span className="text-primary-foreground/30">•</span>
              <a href="tel:+919812550200" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2 rounded-full border border-white/20 transition-all">
                <Phone className="w-3.5 h-3.5 text-secondary" /> +91 98125 50200
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── MAIN PROFILE SECTION ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-12">

          {/* Main Principal Card with Enhanced Picture Presentation */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                
                {/* Enhanced Photo Column */}
                <div className="lg:w-84 shrink-0 bg-gradient-to-b from-primary via-primary/95 to-primary flex flex-col items-center justify-center p-8 sm:p-10 gap-5 text-center relative overflow-hidden">
                  
                  {/* Styled Image Frame */}
                  <div className="relative group">
                    <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl p-1.5 bg-gradient-to-tr from-secondary via-amber-300 to-secondary shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                      <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 border-2 border-white/20 relative">
                        <img 
                          src={principalImg} 
                          alt="Sh. Ramphal Sharma - Principal BVPS Kalayat" 
                          className="w-full h-full object-cover object-top brightness-105 contrast-105" 
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[14px]" />
                      </div>
                    </div>
                    {/* Experience floating badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-secondary text-primary font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg border border-amber-200/80 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> {t('principal.experience', '20+ Years Exp.')}
                    </div>
                  </div>

                  {/* Name and Designation */}
                  <div className="mt-3 relative z-10">
                    <h2 className="text-white font-serif font-bold text-2xl tracking-wide leading-tight">
                      {t('principal.name', 'Sh. Ramphal Sharma')}
                    </h2>
                    <p className="text-secondary text-sm font-semibold uppercase tracking-wider mt-1 flex items-center justify-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> {t('principal.role', 'Principal & Founder')}
                    </p>
                    <p className="text-amber-200/90 text-xs font-medium mt-1">
                      {t('principal.educatorRole', 'Senior Hindi Educator & Literature Specialist')}
                    </p>
                    <p className="text-primary-foreground/70 text-xs mt-0.5">
                      {t('principal.schoolName', 'Bal Vikas Public School, Kalayat (Kaithal)')}
                    </p>
                    
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 flex-wrap">
                      <span className="text-[11px] bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full border border-white/15">
                        {t('principal.est', 'Est. 2004')}
                      </span>
                      <span className="text-[11px] bg-secondary/20 text-secondary font-bold px-2.5 py-0.5 rounded-full border border-secondary/30">
                        {t('principal.studentsGuided', '945+ Students Guided')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative & Message Content in English */}
                <div className="flex-1 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                  <div>
                    {/* Headline Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-secondary/10 text-secondary font-bold text-xs px-3 py-1 rounded-lg uppercase tracking-wider">
                        Leadership Philosophy &amp; Vision
                      </span>
                    </div>

                    <Quote className="w-10 h-10 text-secondary/30 mb-3" />
                    
                    <p className="text-foreground text-lg sm:text-xl font-serif leading-relaxed italic mb-6 font-medium text-slate-800">
                      {t('principal.quote')}
                    </p>

                    <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                      <p>
                        <strong className="text-foreground">{t('principal.p1_title')}</strong> {t('principal.p1_text')}
                      </p>
                      
                      <p>
                        <strong className="text-foreground">{t('principal.p2_title')}</strong> {t('principal.p2_text')}
                      </p>

                      <p>
                        <strong className="text-foreground">{t('principal.p3_title')}</strong> {t('principal.p3_text')}
                      </p>
                    </div>
                  </div>

                  {/* Footer of card with Direct Message CTA */}
                  <div className="pt-6 mt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-serif font-bold text-foreground text-base">{t('principal.name', 'Sh. Ramphal Sharma')}</p>
                      <p className="text-secondary text-xs font-semibold">{t('principal.role', 'Principal & Founder')}, BVPS Kalayat</p>
                    </div>
                    <a 
                      href="#message-form" 
                      className="inline-flex items-center gap-2 text-primary font-bold text-xs sm:text-sm bg-secondary/15 hover:bg-secondary text-secondary hover:text-primary px-4 py-2.5 rounded-xl transition-all border border-secondary/30 self-start sm:self-auto shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> {t('home.messagePrincipalBtn', 'Message Principal Direct')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── 4 CORE PILLARS OF LEADERSHIP ── */}
          <div>
            <ScrollReveal>
              <div className="text-center mb-8">
                <span className="text-secondary font-bold uppercase tracking-widest text-xs">Core Mentorship</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-1">
                  {t('pillar.heading')}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2">
                  {t('pillar.subheading')}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Award,
                  title: t('pillar1.title', '20+ Years Experience'),
                  sub: t('pillar1.sub', 'Dedicated Leadership'),
                  desc: t('pillar1.desc'),
                  color: 'text-amber-600 bg-amber-50 border-amber-200',
                },
                {
                  icon: BookOpen,
                  title: t('pillar2.title', 'Senior Hindi Educator'),
                  sub: t('pillar2.sub', 'Language & Literature'),
                  desc: t('pillar2.desc'),
                  color: 'text-blue-600 bg-blue-50 border-blue-200',
                },
                {
                  icon: Compass,
                  title: t('pillar3.title', 'Noble Thoughts & Values'),
                  sub: t('pillar3.sub', 'Character Building'),
                  desc: t('pillar3.desc'),
                  color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                },
                {
                  icon: HeartHandshake,
                  title: t('pillar4.title', 'Accessible Mentor'),
                  sub: t('pillar4.sub', 'Student & Parent Welfare'),
                  desc: t('pillar4.desc'),
                  color: 'text-purple-600 bg-purple-50 border-purple-200',
                },
              ].map(({ icon: Icon, title, sub, desc, color }) => (
                <ScrollReveal key={title}>
                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                    <div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-foreground text-base leading-snug">{title}</h4>
                      <p className="text-secondary text-xs font-semibold mt-0.5 mb-2.5">{sub}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '20+ Yrs', label: t('stat.exp', 'Teaching & Leadership'), icon: Star },
              { value: '945+', label: t('stat.students', 'Current Enrolled Students'), icon: User },
              { value: '29', label: t('stat.teachers', 'Dedicated Faculty Members'), icon: GraduationCap },
              { value: '1–12', label: t('stat.classes', 'HBSE Classes (1st to 12th)'), icon: BookOpen },
            ].map(({ value, label, icon: Icon }) => (
              <ScrollReveal key={label}>
                <div className="bg-white rounded-2xl border border-border shadow-sm p-5 text-center flex flex-col items-center justify-center">
                  <Icon className="w-5 h-5 text-secondary mb-2" />
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-1">{value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* ── DIRECT MESSAGE TO PRINCIPAL FORM SECTION ── */}
          <div id="message-form" className="scroll-mt-28">
            <ScrollReveal>
              <div className="bg-white rounded-3xl border-2 border-secondary/40 shadow-2xl overflow-hidden">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-primary via-primary/95 to-primary p-6 sm:p-8 text-white relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary shrink-0">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl sm:text-3xl font-serif font-bold">{t('form.title')}</h2>
                          <span className="bg-secondary text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Direct Desk</span>
                        </div>
                        <p className="text-primary-foreground/80 text-xs sm:text-sm mt-0.5">
                          {t('form.subtitle')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 text-xs text-primary-foreground/90 backdrop-blur-sm self-start sm:self-auto">
                      <Clock className="w-4 h-4 text-secondary shrink-0" />
                      <span>Response within 24 hrs (Mon–Sat)</span>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-10">
                  {submittedReceipt ? (
                    <div className="text-center py-10 px-4 max-w-lg mx-auto">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-foreground">Message Delivered!</h3>
                      <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                        Thank you <span className="font-semibold text-foreground">{submittedReceipt.senderName}</span>. Your message has been logged and submitted directly to Sh. Ramphal Sharma's administration desk.
                      </p>

                      <div className="my-6 bg-muted/50 p-4 rounded-2xl border border-border/80 text-left text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference ID:</span>
                          <span className="font-mono font-bold text-primary">{submittedReceipt.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-semibold text-foreground">{submittedReceipt.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="font-semibold text-foreground">{submittedReceipt.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Submitted At:</span>
                          <span className="text-foreground">{new Date(submittedReceipt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(submittedReceipt.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={resetForm}
                          className="bg-primary text-white font-bold rounded-xl px-5 py-2.5 text-xs hover:bg-primary/90 transition-colors"
                        >
                          Send Another Message
                        </button>
                        <a
                          href="https://wa.me/919812550200"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] text-white font-bold rounded-xl px-5 py-2.5 text-xs hover:bg-[#20b859] transition-colors inline-flex items-center justify-center gap-2"
                        >
                          Follow Up on WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                            {t('form.name')} <span className="text-destructive">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                            <input
                              type="text"
                              required
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="e.g. Ramesh Kumar / Suman Devi"
                              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                            />
                          </div>
                        </div>

                        {/* Role / Identity */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                            {t('form.role')} <span className="text-destructive">*</span>
                          </label>
                          <select
                            value={senderRole}
                            onChange={(e) => setSenderRole(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          >
                            <option value="Parent">Parent / Guardian (अभिभावक)</option>
                            <option value="Prospective Parent">Prospective Parent (New Admission Query)</option>
                            <option value="Student">Current BVPS Student (विद्यार्थी)</option>
                            <option value="Alumni">BVPS Alumnus (ਪੁਰਾਣਾ ਵਿਦਿਆਰਥੀ)</option>
                            <option value="Visitor">Community Member / Visitor</option>
                          </select>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                            {t('form.phone')} <span className="text-destructive">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. 98125 50200"
                              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                            {t('form.email')}
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. yourname@gmail.com"
                              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Topic & Subject */}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                            {t('form.category')} <span className="text-destructive">*</span>
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium"
                          >
                            <option value="Admission Guidance">Admission Guidance &amp; Session 2025-26</option>
                            <option value="Academic Progress">Student Academic Performance &amp; Guidance</option>
                            <option value="Personal Appointment Request">Request In-Person Meeting with Principal</option>
                            <option value="Discipline & Values">School Discipline &amp; Student Welfare</option>
                            <option value="Fee & Scholarships">Fee Structure &amp; Scholarship Inquiry</option>
                            <option value="Feedback / Suggestion">Feedback / Appreciation / Suggestion</option>
                            <option value="General Query">General School Query</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                            {t('form.subject')}
                          </label>
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Class 9th Admission Guidance / Meeting Request"
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          />
                        </div>
                      </div>

                      {/* Message Content */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                            {t('form.message')} <span className="text-destructive">*</span>
                          </label>
                          <span className="text-[11px] text-muted-foreground">{message.length} characters</span>
                        </div>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t('form.messagePlaceholder')}
                          className="w-full bg-background border border-border rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-y"
                        />
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-secondary" />
                          {t('form.confidential')}
                        </p>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {/* Send via WhatsApp button */}
                          <button
                            type="button"
                            onClick={handleWhatsAppSend}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20b859] font-bold rounded-xl px-4 py-2.5 text-xs transition-colors shadow-sm"
                            title="Open in WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>{t('form.whatsapp', 'WhatsApp')}</span>
                          </button>

                          {/* Submit button */}
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-xl px-6 py-2.5 text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'Sending...' : t('form.submit', 'Send to Principal')}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Direct Calling Card */}
          <ScrollReveal>
            <div className="bg-primary text-white rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-serif font-bold mb-1">Direct Call to Principal's Office</h3>
                <p className="text-primary-foreground/80 text-sm">
                  {t('form.urgent', 'Have urgent admission or administrative questions? Sh. Ramphal Sharma is available to assist you.')}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <a href="tel:+919812550200" className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-6 h-11 text-sm transition-colors whitespace-nowrap">
                  <Phone className="w-4 h-4" /> Call +91 98125 50200
                </a>
                <Link href="/application" className="inline-flex items-center gap-2 border border-white text-white hover:bg-white hover:text-primary font-bold rounded-full px-6 h-11 text-sm bg-white/10 transition-colors whitespace-nowrap">
                  {t('nav.apply', 'Apply for Admission')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </div>
  );
}



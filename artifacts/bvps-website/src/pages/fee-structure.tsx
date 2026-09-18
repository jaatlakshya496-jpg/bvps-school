import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { IndianRupee, CheckCircle2, Phone, ArrowLeft, Info, BookOpen, FlaskConical, TrendingUp, Palette, ChevronDown, Copy, Check, QrCode, Smartphone, Lock, X, Save, RotateCcw, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { apiGet, apiGetAdmin, apiSend } from '@/lib/api';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.webp';

// ── UPI Payment Config ────────────────────────────────────────────────────────
const UPI_ID   = 'bvpskalayat@sbi';
const UPI_NAME = 'Bal Vikas Public School';

// ── Fee Config Types & Defaults ───────────────────────────────────────────────
interface FeeClass  { name: string; group: string; admission: number; monthly: number; annualFund: number; }
interface FeeStream { name: string; hindiName: string; admission: number; monthly: number; annualFund: number; }
interface FeeConfig { classes: FeeClass[]; streams: FeeStream[]; }

const DEFAULT_FEES: FeeConfig = {
  classes: [
    { name: 'Class 1',  group: 'Primary',   admission: 3000, monthly: 900,  annualFund: 1500 },
    { name: 'Class 2',  group: 'Primary',   admission: 3000, monthly: 950,  annualFund: 1500 },
    { name: 'Class 3',  group: 'Primary',   admission: 3500, monthly: 1000, annualFund: 1800 },
    { name: 'Class 4',  group: 'Primary',   admission: 3500, monthly: 1050, annualFund: 1800 },
    { name: 'Class 5',  group: 'Primary',   admission: 3500, monthly: 1100, annualFund: 2000 },
    { name: 'Class 6',  group: 'Middle',    admission: 4500, monthly: 1300, annualFund: 2000 },
    { name: 'Class 7',  group: 'Middle',    admission: 4500, monthly: 1400, annualFund: 2000 },
    { name: 'Class 8',  group: 'Middle',    admission: 4500, monthly: 1500, annualFund: 2500 },
    { name: 'Class 9',  group: 'Secondary', admission: 5500, monthly: 2500, annualFund: 5000 },
    { name: 'Class 10', group: 'Secondary', admission: 5500, monthly: 2500, annualFund: 5000 },
  ],
  streams: [
    { name: 'Arts',        hindiName: 'कला',    admission: 7000, monthly: 2800, annualFund: 6400 },
    { name: 'Commerce',    hindiName: 'वाणिज्य', admission: 7000, monthly: 3200, annualFund: 6600 },
    { name: 'Non-Medical', hindiName: 'विज्ञान', admission: 7000, monthly: 3700, annualFund: 5600 },
  ],
};

const ADMIN_KEY_STORAGE = 'bvps_admin_key';

const classGroupMeta: Record<string, { color: string; badge: string }> = {
  Primary:   { color: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700' },
  Middle:    { color: 'bg-green-50',  badge: 'bg-green-100 text-green-700' },
  Secondary: { color: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
};
const defaultGroupMeta = { color: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700' };

const streamMeta: Record<string, {
  icon: typeof Palette;
  color: string;
  lightBg: string;
  border: string;
  textColor: string;
  subjects: string[];
}> = {
  Arts: {
    icon: Palette,
    color: 'from-purple-600 to-purple-800',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    subjects: ['Hindi / English', 'History', 'Political Science', 'Geography', 'Economics / Fine Arts'],
  },
  Commerce: {
    icon: TrendingUp,
    color: 'from-emerald-600 to-emerald-800',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'English / Hindi', 'Maths (optional)'],
  },
  'Non-Medical': {
    icon: FlaskConical,
    color: 'from-blue-600 to-blue-800',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / Biology'],
  },
};
const defaultStreamMeta = {
  icon: BookOpen,
  color: 'from-slate-600 to-slate-800',
  lightBg: 'bg-slate-50',
  border: 'border-slate-200',
  textColor: 'text-slate-700',
  subjects: [] as string[],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const rupee    = (n: number) => `₹ ${n.toLocaleString('en-IN')}`;
const yearTotal = (f: { monthly: number; annualFund: number }) => f.monthly * 12 + f.annualFund;

function upiString(amount: number, note: string) {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}
function appLink(scheme: string, amount: number, note: string) {
  const q = `pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  if (scheme === 'phonepe') return `phonepe://pay?${q}`;
  if (scheme === 'gpay')    return `tez://upi/pay?${q}`;
  if (scheme === 'paytm')   return `paytmmp://pay?${q}`;
  if (scheme === 'bhim')    return `bhim://pay?${q}`;
  return `upi://pay?${q}`;
}

const upiApps = [
  {
    id: 'phonepe', label: 'PhonePe',
    gradient: 'from-[#5f259f] to-[#7b2fbe]',
    textColor: 'text-white',
    logo: (
      <svg viewBox="0 0 60 60" className="w-8 h-8" fill="none">
        <rect width="60" height="60" rx="12" fill="#5f259f"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">Pe</text>
      </svg>
    ),
  },
  {
    id: 'gpay', label: 'Google Pay',
    gradient: 'from-white to-gray-50',
    textColor: 'text-gray-700',
    border: 'border border-gray-200',
    logo: (
      <svg viewBox="0 0 60 60" className="w-8 h-8" fill="none">
        <rect width="60" height="60" rx="12" fill="white"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="Arial">
          <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">P</tspan>
        </text>
      </svg>
    ),
  },
  {
    id: 'paytm', label: 'Paytm',
    gradient: 'from-[#002970] to-[#00457c]',
    textColor: 'text-white',
    logo: (
      <svg viewBox="0 0 60 60" className="w-8 h-8" fill="none">
        <rect width="60" height="60" rx="12" fill="#002970"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="#00b9f1" fontSize="13" fontWeight="bold" fontFamily="Arial">PAY</text>
      </svg>
    ),
  },
  {
    id: 'bhim', label: 'BHIM UPI',
    gradient: 'from-[#00529b] to-[#006cbf]',
    textColor: 'text-white',
    logo: (
      <svg viewBox="0 0 60 60" className="w-8 h-8" fill="none">
        <rect width="60" height="60" rx="12" fill="#00529b"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">BHIM</text>
      </svg>
    ),
  },
  {
    id: 'upi', label: 'Other UPI',
    gradient: 'from-gray-700 to-gray-900',
    textColor: 'text-white',
    logo: (
      <svg viewBox="0 0 60 60" className="w-8 h-8" fill="none">
        <rect width="60" height="60" rx="12" fill="#555"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">UPI</text>
      </svg>
    ),
  },
];

export default function FeeStructure() {
  const [fees, setFees]                     = useState<FeeConfig>(DEFAULT_FEES);
  const [selectedClass, setSelectedClass]   = useState<string>('Class 1');
  const [copied, setCopied]                 = useState(false);
  const [payTab, setPayTab]                 = useState<'qr' | 'apps'>('qr');

  // ── Admin edit state ──
  const [adminOpen, setAdminOpen]   = useState(false);
  const [adminKey, setAdminKey]     = useState<string>(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '');
  const [passInput, setPassInput]   = useState('');
  const [authError, setAuthError]   = useState('');
  const [checking, setChecking]     = useState(false);
  const [draft, setDraft]           = useState<FeeConfig>(DEFAULT_FEES);
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');
  const unlocked = Boolean(adminKey);

  useEffect(() => {
    let active = true;
    apiGet<{ success: boolean; data: FeeConfig }>('/fees')
      .then(res => { if (active && res?.data) setFees(normalize(res.data)); })
      .catch(() => { /* API down → keep built-in defaults */ });
    return () => { active = false; };
  }, []);

  const admissionAmounts: Record<string, number> = {};
  fees.classes.forEach(c => { admissionAmounts[c.name] = c.admission; });
  fees.streams.forEach(s => {
    admissionAmounts[`Class 11 – ${s.name}`] = s.admission;
    admissionAmounts[`Class 12 – ${s.name}`] = s.admission;
  });
  const classOptions = Object.keys(admissionAmounts);
  const admissionAmt = admissionAmounts[selectedClass] ?? 0;
  const payNote      = `Admission Fee – ${selectedClass} – BVPS Kalayat`;
  const upiStr       = upiString(admissionAmt, payNote);

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Admin handlers ──
  function openAdmin() {
    setSaveMsg('');
    setAuthError('');
    setDraft(fees);
    setAdminOpen(true);
  }

  async function tryUnlock() {
    const key = passInput.trim();
    if (!key) { setAuthError('Passcode daalein'); return; }
    setChecking(true);
    setAuthError('');
    try {
      const res = await apiGetAdmin<{ success: boolean; data: FeeConfig }>('/fees/admin', key);
      if (res?.data) {
        const normalized = normalize(res.data);
        setAdminKey(key);
        sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
        setDraft(normalized);
        setFees(normalized);
        setPassInput('');
      }
    } catch (err: any) {
      const msg = String(err?.error ?? '').toLowerCase();
      if (msg.includes('not configured')) setAuthError('Admin passcode server par set nahi hai (ADMIN_SECRET).');
      else if (msg.includes('forbidden')) setAuthError('Galat passcode. Dobara koshish karein.');
      else setAuthError('Server se connect nahi ho paya. Internet/server check karein.');
    } finally {
      setChecking(false);
    }
  }

  async function saveFees() {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await apiSend<{ success: boolean; data: FeeConfig; message?: string }>('PUT', '/fees/admin', draft, adminKey);
      if (res?.data) {
        const normalized = normalize(res.data);
        setFees(normalized);
        setDraft(normalized);
      }
      setSaveMsg('Fees save ho gayi ✅');
    } catch (err: any) {
      const msg = String(err?.error ?? '').toLowerCase();
      if (msg.includes('forbidden')) {
        setAdminKey('');
        sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        setSaveMsg('Session expire ho gaya — dobara passcode daalein.');
      } else {
        setSaveMsg(err?.error ?? 'Fees save nahi ho payi. Dobara koshish karein.');
      }
    } finally {
      setSaving(false);
    }
  }

  function updateDraft(kind: 'classes' | 'streams', index: number, field: 'admission' | 'monthly' | 'annualFund', value: string) {
    const num = Math.max(0, Math.floor(Number(value) || 0));
    setDraft(d => {
      if (kind === 'classes') {
        return { ...d, classes: d.classes.map((row, i) => (i === index ? { ...row, [field]: num } : row)) };
      }
      return { ...d, streams: d.streams.map((row, i) => (i === index ? { ...row, [field]: num } : row)) };
    });
  }

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>Fee Structure 2025–26 — Bal Vikas Public School Kalayat</title>
        <meta name="description" content="Complete fee structure for Bal Vikas Public School Kalayat — class-wise admission fees, monthly tuition, and easy UPI payment options. Transparent and affordable education." />
        <meta name="keywords" content="school fee structure Kalayat, Bal Vikas Public School fees, admission fee Kalayat, school fees 2025-26, pay school fee online" />
        <link rel="canonical" href="https://bvps-school.vercel.app/fee-structure" />
        <meta property="og:title" content="Fee Structure 2025–26 — Bal Vikas Public School Kalayat" />
        <meta property="og:description" content="Class-wise fee structure with online UPI payment options. Affordable quality education." />
        <meta property="og:image" content="https://bvps-school.vercel.app/assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.webp" />
        <meta property="og:url" content="https://bvps-school.vercel.app/fee-structure" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fee Structure 2025–26 — Bal Vikas Public School Kalayat" />
        <meta name="twitter:description" content="Transparent class-wise fee structure with UPI payment." />
      </Helmet>

      {/* ── Hero ── */}
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Admissions</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">Fee Structure</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Complete, transparent fee details for Class 1 to 12 — Session 2025–26.
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
        <div className="container mx-auto px-4 md:px-6 max-w-5xl space-y-14">

          {/* ── Class 1–10 Table ── */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-border shadow-md overflow-hidden">
              <div className="bg-primary px-8 py-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-white">Class 1 – 10 Fee Structure</h2>
                    <p className="text-primary-foreground/70 text-sm">Session 2025–26</p>
                  </div>
                </div>
                <button
                  onClick={openAdmin}
                  className="hidden sm:inline-flex items-center gap-2 shrink-0 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 transition-colors"
                  title="Fees ko manually change karein"
                >
                  <Lock className="w-3.5 h-3.5" /> Manage Fees
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-primary/5 border-b border-border">
                    <tr>
                      <th className="text-left px-5 py-3 font-bold text-black">Class</th>
                      <th className="text-left px-5 py-3 font-bold text-black">Level</th>
                      <th className="text-left px-5 py-3 font-bold text-black">Admission Fee<br /><span className="text-xs font-normal text-muted-foreground">(one-time)</span></th>
                      <th className="text-left px-5 py-3 font-bold text-black">Monthly Tuition</th>
                      <th className="text-left px-5 py-3 font-bold text-black">Annual Fund</th>
                      <th className="text-left px-5 py-3 font-bold text-black text-green-700">Total / Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fees.classes.map((row) => {
                      const meta = classGroupMeta[row.group] ?? defaultGroupMeta;
                      return (
                        <tr key={row.name} className={`${meta.color} hover:brightness-95 transition-all`}>
                          <td className="px-5 py-3.5 font-bold text-black">{row.name}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>{row.group}</span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{rupee(row.admission)}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{rupee(row.monthly)}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{rupee(row.annualFund)}</td>
                          <td className="px-5 py-3.5 font-bold text-green-700">{rupee(yearTotal(row))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-primary/5 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                Annual total excludes one-time admission fee. Admission fee is paid only once at the time of joining.
              </div>
            </div>
          </ScrollReveal>

          {/* ── Class 11–12 Stream Cards ── */}
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-black">Class 11 &amp; 12 — Stream-wise Fees</h2>
                  <p className="text-muted-foreground text-sm">Session 2025–26 · Choose your stream below</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {fees.streams.map((s) => {
                  const meta = streamMeta[s.name] ?? defaultStreamMeta;
                  const Icon = meta.icon;
                  return (
                    <div key={s.name} className={`rounded-3xl border ${meta.border} overflow-hidden shadow-md`}>
                      {/* Stream header */}
                      <div className={`bg-gradient-to-br ${meta.color} px-6 py-5 text-white`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Stream</span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold">{s.name}</h3>
                        <p className="text-white/70 text-sm">{s.hindiName}</p>
                      </div>

                      {/* Fee breakdown */}
                      <div className={`${meta.lightBg} px-6 py-5 space-y-3`}>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Admission Fee <span className="text-xs">(one-time)</span></span>
                          <span className="font-semibold text-black">{rupee(s.admission)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-border pt-3">
                          <span className="text-muted-foreground">Monthly Tuition</span>
                          <span className="font-semibold text-black">{rupee(s.monthly)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Fund</span>
                          <span className="font-semibold text-black">{rupee(s.annualFund)}</span>
                        </div>
                        <div className={`flex justify-between text-base font-bold border-t border-border pt-3 ${meta.textColor}`}>
                          <span>Total per Year</span>
                          <span>{rupee(yearTotal(s))}</span>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div className="px-6 py-4 bg-white border-t border-border">
                        <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide">Key Subjects</p>
                        <ul className="space-y-1">
                          {meta.subjects.map((sub) => (
                            <li key={sub} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${meta.textColor}`} />
                              {sub}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                Admission fee is paid only once at the time of joining. Annual total = monthly × 12 + annual fund.
              </p>
            </div>
          </ScrollReveal>

          {/* Mobile manage-fees button */}
          <div className="sm:hidden -mt-8">
            <button
              onClick={openAdmin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 text-primary hover:bg-primary/5 text-sm font-semibold px-4 py-3 transition-colors"
            >
              <Lock className="w-4 h-4" /> Manage Fees
            </button>
          </div>

          {/* ── Documents Required ── */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-border shadow-md p-8">
              <h2 className="text-2xl font-serif font-bold text-black mb-2">Documents Required at Admission</h2>
              <p className="text-muted-foreground text-sm mb-6">Please bring originals + 2 photocopies of each document.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['Birth Certificate', 'Municipal / Gram Panchayat issued'],
                  ['Aadhaar Card', "Student's Aadhaar (parent if not available)"],
                  ['Previous School TC', 'Transfer Certificate from last school'],
                  ['Previous Report Card', 'Mark sheet / Progress card'],
                  ['Passport Photos', '4 recent colour photos (white background)'],
                  ['Residence Proof', 'Electricity bill / Ration card / Voter ID'],
                  ['Caste Certificate', 'If applicable (SC / BC / OBC)'],
                ].map(([doc, note]) => (
                  <div key={doc} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-black">{doc}</p>
                      <p className="text-xs text-muted-foreground">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Interactive UPI Payment ── */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-border shadow-md overflow-hidden">

              {/* Header */}
              <div className="bg-primary px-8 py-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Pay Admission Fee Online</h2>
                  <p className="text-primary-foreground/70 text-sm">Select your class — amount fills automatically</p>
                </div>
              </div>

              <div className="p-8 space-y-8">

                {/* Step 1 — Class selector */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Step 1 — Select Class</p>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      className="w-full appearance-none border-2 border-primary/30 focus:border-primary rounded-xl px-4 py-3.5 text-base font-semibold text-black bg-white outline-none cursor-pointer pr-10"
                    >
                      {classOptions.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
                  </div>
                </div>

                {/* Amount display */}
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-1">Admission Fee for {selectedClass}</p>
                    <p className="text-4xl font-serif font-bold text-green-700">₹ {admissionAmt.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-green-600 mt-1">One-time · Session 2025–26</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-green-200 flex items-center justify-center">
                    <IndianRupee className="w-7 h-7 text-green-700" />
                  </div>
                </div>

                {/* Step 2 — Pay now */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Step 2 — Pay Now</p>

                  {/* Tab switcher */}
                  <div className="flex rounded-xl overflow-hidden border border-border mb-5">
                    <button
                      onClick={() => setPayTab('qr')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${payTab === 'qr' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted/40'}`}
                    >
                      <QrCode className="w-4 h-4" /> Scan QR Code
                    </button>
                    <button
                      onClick={() => setPayTab('apps')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${payTab === 'apps' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted/40'}`}
                    >
                      <Smartphone className="w-4 h-4" /> Open App Directly
                    </button>
                  </div>

                  {/* QR Code tab */}
                  {payTab === 'qr' && (
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="bg-white p-4 rounded-2xl border-2 border-primary/20 shadow-md">
                        <QRCode value={upiStr} size={200} bgColor="#ffffff" fgColor="#0a1e3d" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-black">Scan with any UPI app</p>
                        <p className="text-xs text-muted-foreground mt-1">PhonePe · Google Pay · Paytm · BHIM · Any bank app</p>
                        <p className="text-xs text-green-700 font-semibold mt-2">Amount ₹ {admissionAmt.toLocaleString('en-IN')} already filled</p>
                      </div>

                      {/* Copy UPI ID */}
                      <button
                        onClick={copyUpiId}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary/30 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : `Copy UPI ID: ${UPI_ID}`}
                      </button>
                    </div>
                  )}

                  {/* App buttons tab */}
                  {payTab === 'apps' && (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {upiApps.map(app => (
                          <a
                            key={app.id}
                            href={appLink(app.id, admissionAmt, payNote)}
                            className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl bg-gradient-to-br ${app.gradient} ${app.border ?? ''} hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-sm`}
                          >
                            {app.logo}
                            <span className={`text-xs font-bold ${app.textColor}`}>{app.label}</span>
                            <span className={`text-[10px] font-semibold ${app.textColor} opacity-80`}>
                              ₹ {admissionAmt.toLocaleString('en-IN')} →
                            </span>
                          </a>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        Mobile pe tap karo — app khulega with UPI ID <span className="font-mono font-semibold text-black">{UPI_ID}</span> aur amount ₹{admissionAmt.toLocaleString('en-IN')} already filled.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash option */}
                <div className="flex items-start gap-3 text-sm p-4 rounded-xl bg-muted/30 border border-border">
                  <IndianRupee className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-black">Pay by Cash at School Office</p>
                    <p className="text-xs text-muted-foreground">Mon–Sat, 9 AM – 2 PM · Railway Road, Kalayat</p>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="text-sm rounded-xl border border-blue-200 overflow-hidden">
                  <div className="flex items-start gap-3 p-4 bg-blue-50">
                    <IndianRupee className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-black">Bank Transfer (NEFT / IMPS)</p>
                      <div className="space-y-1 text-xs mt-2">
                        <p><span className="font-bold text-black">Bank:</span> State Bank of India, Kalayat</p>
                        <p><span className="font-bold text-black">A/C Name:</span> Bal Vikas Public School</p>
                        <p><span className="font-bold text-black">A/C No.:</span> 39248675012</p>
                        <p><span className="font-bold text-black">IFSC:</span> SBIN0009876</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">* Share transaction ID at office after transfer.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>

          {/* ── CTA ── */}
          <ScrollReveal>
            <div className="bg-primary text-white rounded-3xl p-8 text-center">
              <h3 className="text-xl font-serif font-bold mb-2">Questions about fees?</h3>
              <p className="text-primary-foreground/80 text-sm mb-5">Call us or visit the school office Mon–Sat, 9 AM – 2 PM.</p>
              <a href="tel:+919812550200" className="inline-flex items-center gap-2 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-8 h-11 text-sm transition-colors">
                <Phone className="w-4 h-4" /> +91 98125 50200
              </a>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ── Admin Fee Manager Modal ── */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAdminOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-black">Manage Fees</h3>
                  <p className="text-xs text-muted-foreground">Fees ko yahan se manually change karein — save karte hi website par update ho jayegi.</p>
                </div>
              </div>
              <button onClick={() => setAdminOpen(false)} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!unlocked ? (
              /* ── Passcode gate ── */
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 border border-border rounded-xl p-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  Sirf school admin fees change kar sakta hai. Admin passcode enter karein (Render par set <span className="font-mono">ADMIN_SECRET</span>).
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Admin Passcode</label>
                  <input
                    type="password"
                    value={passInput}
                    onChange={e => setPassInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') tryUnlock(); }}
                    placeholder="Enter passcode"
                    className="w-full border-2 border-primary/30 focus:border-primary rounded-xl px-4 py-3 text-black bg-white outline-none"
                  />
                </div>
                {authError && <p className="text-sm text-red-600">{authError}</p>}
                <button
                  onClick={tryUnlock}
                  disabled={checking}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl h-11 hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {checking ? 'Checking…' : 'Unlock'}
                </button>
              </div>
            ) : (
              /* ── Editor ── */
              <>
                <div className="p-6 space-y-8 overflow-y-auto">
                  {/* Classes */}
                  <div>
                    <h4 className="text-sm font-bold text-black mb-1">Class 1 – 10</h4>
                    <p className="text-xs text-muted-foreground mb-3">Total / Year apne aap banta hai (monthly × 12 + annual fund).</p>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-black">Class</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Admission ₹</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Monthly ₹</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Annual Fund ₹</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Total / Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {draft.classes.map((row, i) => (
                            <tr key={row.name}>
                              <td className="px-3 py-2 font-semibold text-black whitespace-nowrap">{row.name}</td>
                              {(['admission', 'monthly', 'annualFund'] as const).map(field => (
                                <td key={field} className="px-2 py-2">
                                  <input
                                    type="number"
                                    min={0}
                                    value={row[field]}
                                    onFocus={e => e.currentTarget.select()}
                                    onChange={e => updateDraft('classes', i, field, e.target.value)}
                                    className="w-24 border border-border rounded-lg px-2 py-1.5 text-black bg-white outline-none focus:border-primary"
                                  />
                                </td>
                              ))}
                              <td className="px-3 py-2 font-bold text-green-700 whitespace-nowrap">{rupee(yearTotal(row))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Streams */}
                  <div>
                    <h4 className="text-sm font-bold text-black mb-1">Class 11 &amp; 12 — Streams</h4>
                    <p className="text-xs text-muted-foreground mb-3">Stream ka admission fee Class 11 aur 12 dono ke liye use hota hai.</p>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-black">Stream</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Admission ₹</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Monthly ₹</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Annual Fund ₹</th>
                            <th className="text-left px-3 py-2 font-semibold text-black">Total / Year</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {draft.streams.map((row, i) => (
                            <tr key={row.name}>
                              <td className="px-3 py-2 font-semibold text-black whitespace-nowrap">{row.name}</td>
                              {(['admission', 'monthly', 'annualFund'] as const).map(field => (
                                <td key={field} className="px-2 py-2">
                                  <input
                                    type="number"
                                    min={0}
                                    value={row[field]}
                                    onFocus={e => e.currentTarget.select()}
                                    onChange={e => updateDraft('streams', i, field, e.target.value)}
                                    className="w-24 border border-border rounded-lg px-2 py-1.5 text-black bg-white outline-none focus:border-primary"
                                  />
                                </td>
                              ))}
                              <td className="px-3 py-2 font-bold text-green-700 whitespace-nowrap">{rupee(yearTotal(row))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => { setDraft(DEFAULT_FEES); setSaveMsg(''); }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-black transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset to original
                  </button>
                  <span className="flex-1 text-sm text-center sm:text-left">
                    {saveMsg && <span className={saveMsg.includes('✅') ? 'text-green-700 font-semibold' : 'text-red-600'}>{saveMsg}</span>}
                  </span>
                  <button
                    onClick={saveFees}
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl px-6 h-11 hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Fees'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function normalize(config: FeeConfig): FeeConfig {
  const classes = Array.isArray(config?.classes) && config.classes.length ? config.classes : DEFAULT_FEES.classes;
  const streams = Array.isArray(config?.streams) && config.streams.length ? config.streams : DEFAULT_FEES.streams;
  return { classes, streams };
}

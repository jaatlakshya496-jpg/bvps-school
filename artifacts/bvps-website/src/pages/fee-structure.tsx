import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { IndianRupee, CheckCircle2, Phone, ArrowLeft, Info, BookOpen, FlaskConical, TrendingUp, Palette, ChevronDown, Copy, Check, QrCode, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';

// ── UPI Payment Config ────────────────────────────────────────────────────────
const UPI_ID   = 'bvpskalayat@sbi';
const UPI_NAME = 'Bal Vikas Public School';

const classAdmissionAmounts: Record<string, number> = {
  'Class 1': 3000,  'Class 2': 3000,
  'Class 3': 3500,  'Class 4': 3500,  'Class 5': 3500,
  'Class 6': 4500,  'Class 7': 4500,  'Class 8': 4500,
  'Class 9': 5500,  'Class 10': 5500,
  'Class 11 – Arts': 7000, 'Class 11 – Commerce': 7000, 'Class 11 – Non-Medical': 7000,
  'Class 12 – Arts': 7000, 'Class 12 – Commerce': 7000, 'Class 12 – Non-Medical': 7000,
};
const classOptions = Object.keys(classAdmissionAmounts);

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

// ── Fee Data ──────────────────────────────────────────────────────────────────

const classFees = [
  { cls: 'Class 1',  group: 'Primary',   color: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   admission: '₹ 3,000', monthly: '₹ 900',   annualFund: '₹ 1,500', totalYear: '₹ 12,300' },
  { cls: 'Class 2',  group: 'Primary',   color: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   admission: '₹ 3,000', monthly: '₹ 950',   annualFund: '₹ 1,500', totalYear: '₹ 12,900' },
  { cls: 'Class 3',  group: 'Primary',   color: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   admission: '₹ 3,500', monthly: '₹ 1,000', annualFund: '₹ 1,800', totalYear: '₹ 13,800' },
  { cls: 'Class 4',  group: 'Primary',   color: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   admission: '₹ 3,500', monthly: '₹ 1,050', annualFund: '₹ 1,800', totalYear: '₹ 14,400' },
  { cls: 'Class 5',  group: 'Primary',   color: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   admission: '₹ 3,500', monthly: '₹ 1,100', annualFund: '₹ 2,000', totalYear: '₹ 15,200' },
  { cls: 'Class 6',  group: 'Middle',    color: 'bg-green-50',  badge: 'bg-green-100 text-green-700', admission: '₹ 4,500', monthly: '₹ 1,300', annualFund: '₹ 2,000', totalYear: '₹ 17,600' },
  { cls: 'Class 7',  group: 'Middle',    color: 'bg-green-50',  badge: 'bg-green-100 text-green-700', admission: '₹ 4,500', monthly: '₹ 1,400', annualFund: '₹ 2,000', totalYear: '₹ 18,800' },
  { cls: 'Class 8',  group: 'Middle',    color: 'bg-green-50',  badge: 'bg-green-100 text-green-700', admission: '₹ 4,500', monthly: '₹ 1,500', annualFund: '₹ 2,500', totalYear: '₹ 20,500' },
  { cls: 'Class 9',  group: 'Secondary', color: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', admission: '₹ 5,500', monthly: '₹ 2,500', annualFund: '₹ 5,000', totalYear: '₹ 35,000' },
  { cls: 'Class 10', group: 'Secondary', color: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', admission: '₹ 5,500', monthly: '₹ 2,500', annualFund: '₹ 5,000', totalYear: '₹ 35,000' },
];

const seniorStreams = [
  {
    stream: 'Arts',
    hindiName: 'कला',
    icon: Palette,
    color: 'from-purple-600 to-purple-800',
    lightBg: 'bg-purple-50',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    subjects: ['Hindi / English', 'History', 'Political Science', 'Geography', 'Economics / Fine Arts'],
    admission: '₹ 7,000',
    monthly: '₹ 2,800',
    annualFund: '₹ 6,400',
    totalYear: '₹ 40,000',
  },
  {
    stream: 'Commerce',
    hindiName: 'वाणिज्य',
    icon: TrendingUp,
    color: 'from-emerald-600 to-emerald-800',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'English / Hindi', 'Maths (optional)'],
    admission: '₹ 7,000',
    monthly: '₹ 3,200',
    annualFund: '₹ 6,600',
    totalYear: '₹ 45,000',
  },
  {
    stream: 'Non-Medical',
    hindiName: 'विज्ञान',
    icon: FlaskConical,
    color: 'from-blue-600 to-blue-800',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / Biology'],
    admission: '₹ 7,000',
    monthly: '₹ 3,700',
    annualFund: '₹ 5,600',
    totalYear: '₹ 50,000',
  },
];

export default function FeeStructure() {
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [copied, setCopied]               = useState(false);
  const [payTab, setPayTab]               = useState<'qr' | 'apps'>('qr');

  const admissionAmt = classAdmissionAmounts[selectedClass];
  const payNote      = `Admission Fee – ${selectedClass} – BVPS Kalayat`;
  const upiStr       = upiString(admissionAmt, payNote);

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col">

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
              <div className="bg-primary px-8 py-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Class 1 – 10 Fee Structure</h2>
                  <p className="text-primary-foreground/70 text-sm">Session 2025–26</p>
                </div>
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
                    {classFees.map((row) => (
                      <tr key={row.cls} className={`${row.color} hover:brightness-95 transition-all`}>
                        <td className="px-5 py-3.5 font-bold text-black">{row.cls}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.badge}`}>{row.group}</span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{row.admission}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{row.monthly}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{row.annualFund}</td>
                        <td className="px-5 py-3.5 font-bold text-green-700">{row.totalYear}</td>
                      </tr>
                    ))}
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
                {seniorStreams.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.stream} className={`rounded-3xl border ${s.border} overflow-hidden shadow-md`}>
                      {/* Stream header */}
                      <div className={`bg-gradient-to-br ${s.color} px-6 py-5 text-white`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Stream</span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold">{s.stream}</h3>
                        <p className="text-white/70 text-sm">{s.hindiName}</p>
                      </div>

                      {/* Fee breakdown */}
                      <div className={`${s.lightBg} px-6 py-5 space-y-3`}>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Admission Fee <span className="text-xs">(one-time)</span></span>
                          <span className="font-semibold text-black">{s.admission}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-border pt-3">
                          <span className="text-muted-foreground">Monthly Tuition</span>
                          <span className="font-semibold text-black">{s.monthly}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Fund</span>
                          <span className="font-semibold text-black">{s.annualFund}</span>
                        </div>
                        <div className={`flex justify-between text-base font-bold border-t border-border pt-3 ${s.textColor}`}>
                          <span>Total per Year</span>
                          <span>{s.totalYear}</span>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div className="px-6 py-4 bg-white border-t border-border">
                        <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide">Key Subjects</p>
                        <ul className="space-y-1">
                          {s.subjects.map((sub) => (
                            <li key={sub} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${s.textColor}`} />
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
                Admission fee (₹ 7,000) is paid only once at the time of joining. Annual total = monthly × 12 + annual fund.
              </p>
            </div>
          </ScrollReveal>

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
    </div>
  );
}

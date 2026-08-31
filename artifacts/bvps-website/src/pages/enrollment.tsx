import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { ClipboardList, CheckSquare, Square, CheckCircle2, IndianRupee, GraduationCap, Phone, ArrowLeft } from 'lucide-react';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';

const enrollmentItems = [
  'Admission confirmation letter from school',
  'Original + photocopy of all required documents',
  'Admission fee payment (cash / online transfer)',
  'Student Aadhaar card copy',
  'Signed school rules & parent declaration form',
  'Medical fitness certificate (if required)',
  '4 passport-size photographs',
  'Previous school TC (Transfer Certificate)',
  'School uniform: white shirt, black pants & black shoes (from approved vendor)',
  'School diary & stationery as per class list',
];

export default function Enrollment() {
  const [checked, setChecked] = useState<boolean[]>(enrollmentItems.map(() => false));
  const checkedCount = checked.filter(Boolean).length;

  return (
    <div className="flex flex-col">
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Admissions</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">Enrollment</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Final step — complete formalities and officially join the BVPS family.
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
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Checklist */}
            <ScrollReveal>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-black flex items-center gap-2 text-base">
                    <ClipboardList className="w-5 h-5 text-secondary" /> Enrollment Checklist
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${checkedCount === enrollmentItems.length ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {checkedCount}/{enrollmentItems.length} done
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Tick each item as you prepare before visiting school.</p>
                <ul className="space-y-2">
                  {enrollmentItems.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => setChecked(prev => prev.map((v, j) => j === i ? !v : v))}
                        className="w-full flex items-start gap-3 text-left p-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
                      >
                        {checked[i]
                          ? <CheckSquare className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          : <Square className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-muted-foreground transition-colors" />
                        }
                        <span className={`text-sm transition-colors ${checked[i] ? 'text-muted-foreground line-through' : 'text-black'}`}>
                          {item}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {checkedCount === enrollmentItems.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> You're all set! Visit school to complete enrollment.
                  </motion.div>
                )}
              </div>
            </ScrollReveal>

            {/* Payment + Welcome */}
            <div className="space-y-6">
              <ScrollReveal>
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-bold text-black mb-4 flex items-center gap-2 text-base">
                    <IndianRupee className="w-5 h-5 text-secondary" /> Fee Payment Options
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm p-3 rounded-xl bg-muted/30 border border-border">
                      <IndianRupee className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-black">Cash</p>
                        <p className="text-xs text-muted-foreground">At the school office, Mon–Sat 9 AM – 2 PM</p>
                      </div>
                    </div>
                    <a href="upi://pay?pa=bvpskalayat@sbi&pn=Bal%20Vikas%20Public%20School&cu=INR"
                      className="flex items-start gap-3 text-sm p-3 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors group">
                      <IndianRupee className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-black group-hover:text-green-700">UPI / PhonePe / GPay</p>
                        <p className="text-xs text-muted-foreground">UPI ID: <span className="font-mono font-bold text-green-700">bvpskalayat@sbi</span></p>
                        <p className="text-xs text-green-600 font-semibold">Tap to open payment app →</p>
                      </div>
                    </a>
                    <div className="text-sm rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <p className="font-semibold text-black mb-1">Bank Transfer (NEFT / IMPS)</p>
                      <div className="space-y-0.5 text-xs">
                        <p><span className="font-bold text-black">Bank:</span> SBI, Kalayat</p>
                        <p><span className="font-bold text-black">A/C Name:</span> Bal Vikas Public School</p>
                        <p><span className="font-bold text-black">A/C No.:</span> 39248675012</p>
                        <p><span className="font-bold text-black">IFSC:</span> SBIN0009876</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-primary rounded-2xl p-6 text-white">
                  <GraduationCap className="w-8 h-8 text-secondary mb-3" />
                  <h4 className="font-bold text-lg mb-2">Welcome to BVPS!</h4>
                  <p className="text-primary-foreground/75 text-sm leading-relaxed mb-4">
                    Once enrolled, you'll receive the school diary, fee receipt, and a welcome letter. Your child's journey to excellence begins here.
                  </p>
                  <a href="tel:+919812550200" className="inline-flex items-center gap-2 text-secondary font-semibold text-sm hover:underline">
                    <Phone className="w-4 h-4" /> +91 98125 50200
                  </a>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

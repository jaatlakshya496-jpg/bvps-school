import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PageSeo } from '@/lib/seo';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import heroImg from '@assets/bal-vikas-public-school_1784611430239.webp';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col">
      <PageSeo path="/privacy-policy" />
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="Bal Vikas Public School campus" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Privacy Policy</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <Link href="/" className="inline-flex items-center gap-2 mt-6 text-primary-foreground/70 hover:text-secondary transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 md:p-10 space-y-6 text-foreground/90 leading-relaxed">
              <div>
                <h2 className="text-xl font-serif font-bold text-black mb-2">Information We Collect</h2>
                <p>When you use our admission form, contact form, or other forms on this website, we may collect personal information including your name, phone number, email address, address, student details, and any message you submit.</p>
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-black mb-2">How We Use Information</h2>
                <p>We use the information solely for school-related purposes such as responding to admission enquiries, handling contact requests, and communicating with parents/guardians. We do not sell or share personal information with third parties for marketing purposes.</p>
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-black mb-2">Data Protection</h2>
                <p>We take reasonable measures to protect submitted information. Admission and contact records are stored securely in our school database and are only accessible to authorized school personnel.</p>
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-black mb-2">Consent</h2>
                <p>By submitting forms on this website, you consent to the collection and use of your information as described in this policy.</p>
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-black mb-2">Contact</h2>
                <p>For questions about this Privacy Policy, please contact the school office at the details provided on our Contact page.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

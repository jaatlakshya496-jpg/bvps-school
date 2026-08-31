import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Link } from 'wouter';
import { Clock, MapPin, Phone, ArrowLeft, Building2, User, Info } from 'lucide-react';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.jpg';

export default function SchoolTiming() {
  return (
    <div className="flex flex-col">
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Admissions</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">School Timings</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Office hours, school schedule, and visit guidelines.
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
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-10">

          {/* Timings grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { label: 'School Hours', value: 'Monday – Saturday', time: '8:00 AM – 3:00 PM', sub: 'Sunday: Closed', color: 'border-t-secondary', icon: Clock },
              { label: 'Admission Office', value: 'Monday – Saturday', time: '9:00 AM – 2:00 PM', sub: 'Best time to visit: 10 AM – 12 PM', color: 'border-t-blue-400', icon: Building2 },
              { label: 'Morning Assembly', value: 'Every Day', time: '8:00 AM sharp', sub: 'All students must be present', color: 'border-t-orange-400', icon: Clock },
              { label: 'Break / Recess', value: 'Daily', time: '12:00 PM – 12:30 PM', sub: 'Mid-day meal available', color: 'border-t-green-400', icon: Clock },
            ].map(({ label, value, time, sub, icon: Icon }) => (
              <ScrollReveal key={label}>
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 border-t-4 border-t-secondary">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="font-bold text-black text-base">{label}</h3>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{value}</p>
                  <p className="text-2xl font-serif font-bold text-black mb-1">{time}</p>
                  <p className="text-sm text-muted-foreground">{sub}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Contact & Location */}
          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-border shadow-md p-8">
              <h2 className="text-2xl font-serif font-bold text-black mb-6">Contact &amp; Location</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Phone, label: 'Phone', value: '+91 98125 50200', note: 'Mon–Sat, 9 AM – 2 PM', href: 'tel:+919812550200' },
                  { icon: Phone, label: 'Phone 2', value: '+91 98125 50202', note: 'Mon–Sat, 9 AM – 2 PM', href: 'tel:+919812550202' },
                  { icon: MapPin, label: 'Address', value: 'Railway Road, Kalayat', note: 'District Kaithal, Haryana – 136117' },
                  { icon: User, label: 'Principal', value: 'Sh. Ramphal Sharma', note: 'Available by appointment' },
                  { icon: Building2, label: 'Board', value: 'Haryana Board (HBSE)', note: 'Bhiwani, Haryana' },
                  { icon: Info, label: 'School Code', value: '06050300920', note: 'HBSE registered' },
                ].map(({ icon: Icon, label, value, note, href }) => (
                  <div key={label} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                    <Icon className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-primary hover:text-secondary transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-black">{value}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="https://maps.google.com/?q=Bal+Vikas+Public+School+Kalayat+Kaithal+Haryana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-secondary transition-colors mt-5"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps →
              </a>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </div>
  );
}

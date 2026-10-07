import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { MapPin, Phone, Mail, Clock, GraduationCap, Info } from 'lucide-react';
import schoolLogo from '@/assets/school-logo-kalayat.webp';
import { useSiteContent } from '@/lib/site-content';

const ADMIN_TAPS_NEEDED = 5;

export function Footer() {
  const [, navigate] = useLocation();
  const { get } = useSiteContent();
  const [logoTaps, setLogoTaps] = useState(0);
  const [showAdminHint, setShowAdminHint] = useState(false);
  const resetTimer = useRef<number | null>(null);

  // Admin portal website par link se nahi dikhaya jaata (private rahe). Mobile par
  // owner ko wahi se khulna hota hai — isliye footer logo par 5 baar tap karne
  // par /admin khul jata hai. Link + ?admin=1 dono chalte hain.
  useEffect(() => {
    if (logoTaps === 0) return;
    if (logoTaps >= ADMIN_TAPS_NEEDED) {
      navigate('/admin');
      setLogoTaps(0);
      setShowAdminHint(false);
      return;
    }
    setShowAdminHint(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setLogoTaps(0);
      setShowAdminHint(false);
    }, 1500);
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [logoTaps, navigate]);

  return (
    <footer aria-label="Site footer" className="bg-primary text-primary-foreground pt-16 pb-8 border-t-[8px] border-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group inline-block">
              <div className="bg-white p-1 rounded-xl shadow-md flex items-center justify-center h-14 w-14 group-hover:scale-105 transition-transform duration-200 shrink-0 overflow-hidden">
                <img src={schoolLogo} alt="Bal Vikas Public School Kalayat Logo" className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold leading-tight text-white group-hover:text-secondary transition-colors">BVPS</span>
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Bal Vikas Public School</span>
                <span className="text-[11px] text-primary-foreground/70">Kalayat, Kaithal (Est. 2004)</span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mt-4">
              A trusted neighborhood school in rural Haryana, committed to providing quality education from Classes 1 to 12 since 2004.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Blog & News', path: '/blog' },
                { name: 'Results & Achievements', path: '/results' },
                { name: 'Photo Gallery', path: '/gallery' },
                { name: 'School Facilities', path: '/facilities' },
                { name: 'School Timing', path: '/school-timing' },
                { name: 'Streams (11–12)', path: '/streams' },
                { name: 'Interview & Rules', path: '/interview' },
                { name: 'Enrollment', path: '/enrollment' },
                { name: 'Fee Structure', path: '/fee-structure' },
                { name: 'Contact Us', path: '/contact' },
                { name: "Principal's Desk & Message", path: '/principal-message' },
                { name: 'Write to Principal', path: '/principal-message#message-form' },
                { name: 'Admission Form', path: '/application' },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    href={link.path}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm flex items-center gap-2 before:content-['›'] before:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold mb-6 text-white relative inline-block">
              Quick Information
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">Year of Establishment</p>
                  <p>{get('site.established')}</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">School Code</p>
                  <p>{get('site.schoolCode')}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold mb-6 text-white relative inline-block">
              Contact Info
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>{get('site.address')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href={`tel:${get('site.phone1').replace(/[^+\d]/g, '')}`} className="hover:text-secondary transition-colors">{get('site.phone1')}</a>
                  <a href={`tel:${get('site.phone2').replace(/[^+\d]/g, '')}`} className="hover:text-secondary transition-colors">{get('site.phone2')}</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href={`mailto:${get('site.emailGeneral')}`} className="hover:text-secondary transition-colors">{get('site.emailGeneral')}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold mb-6 text-white relative inline-block">
              School Hours
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">School Days</p>
                  <p>{get('site.hoursWeek')}</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Clock className="w-5 h-5 text-primary-foreground/40 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary-foreground/60 mb-1">Weekly Off</p>
                  <p className="text-primary-foreground/60">{get('site.hoursSunday')}</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright line par hidden admin access: 5 tap. Website links se admin
              portal public nahi dikhta, par mobile par owner usi se khol sakta hai. */}
          <button
            type="button"
            onClick={() => setLogoTaps((count) => count + 1)}
            className="text-primary-foreground/60 text-sm text-center md:text-left hover:text-secondary transition-colors"
          >
            © {new Date().getFullYear()} Bal Vikas Public School, Kalayat. All rights reserved.
            {showAdminHint && (
              <span className="block text-[11px] text-secondary mt-1">
                Admin portal kholne ke liye {ADMIN_TAPS_NEEDED - logoTaps} aur tap karein…
              </span>
            )}
          </button>
          <p className="text-primary-foreground/60 text-sm text-center md:text-right">
            Affiliated to BSEH | Est. 2004 | School Code: 06050300920
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'wouter';
import { MapPin, Phone, Mail, Clock, GraduationCap, Info } from 'lucide-react';
import schoolLogo from '@/assets/school-logo-kalayat.jpg';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t-[8px] border-secondary">
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
                  <p>2004</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white mb-1">School Code</p>
                  <p>06050300920</p>
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
                <span>Railway Road, Kalayat,<br />District Kaithal, Haryana – 136117</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+919812550200" className="hover:text-secondary transition-colors">+91 98125 50200</a>
                  <a href="tel:+919812550202" className="hover:text-secondary transition-colors">+91 98125 50202</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href="mailto:info@bvpskalayat.edu" className="hover:text-secondary transition-colors">info@bvpskalayat.edu</a>
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
                  <p className="font-medium text-white mb-1">Monday - Saturday</p>
                  <p>8:00 AM – 3:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Clock className="w-5 h-5 text-primary-foreground/40 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary-foreground/60 mb-1">Sunday</p>
                  <p className="text-primary-foreground/60">Closed</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Bal Vikas Public School, Kalayat. All rights reserved.
          </p>
          <div className="text-primary-foreground/60 text-sm text-center md:text-right">
            Affiliated to BSEH | Est. 2004 | School Code: 06050300920
          </div>
        </div>
      </div>
    </footer>
  );
}

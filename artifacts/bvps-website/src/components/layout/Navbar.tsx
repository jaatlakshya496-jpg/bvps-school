import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Menu, X, Phone, FileText, IndianRupee, Clock, 
  HelpCircle, UserCheck, BookOpen, User, Building2, 
  Trophy, Image as ImageIcon, MessageSquare, Home as HomeIcon, Info, Sparkles
} from 'lucide-react';
import schoolLogo from '@/assets/school-logo-kalayat.jpg';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useLanguage } from '@/lib/language-context';

export const navLinksConfig = [
  { key: 'nav.home', name: 'Home', path: '/', icon: HomeIcon },
  { key: 'nav.about', name: 'About Us', path: '/about', icon: Info },
  { key: 'nav.results', name: 'Results', path: '/results', icon: Trophy },
  { key: 'nav.gallery', name: 'Gallery', path: '/gallery', icon: ImageIcon },
  { key: 'nav.facilities', name: 'Facilities', path: '/facilities', icon: Building2 },
  { key: 'nav.timing', name: 'School Timing', path: '/school-timing', icon: Clock },
  { key: 'nav.streams', name: 'Streams', path: '/streams', icon: BookOpen },
  { key: 'nav.interview', name: 'Interview', path: '/interview', icon: HelpCircle },
  { key: 'nav.enrollment', name: 'Enrollment', path: '/enrollment', icon: UserCheck },
  { key: 'nav.fees', name: 'Fee Structure', path: '/fee-structure', icon: IndianRupee, highlight: true },
  { key: 'nav.contact', name: 'Contact', path: '/contact', icon: MessageSquare },
  { key: 'nav.principal', name: "Principal's Desk", path: '/principal-message', icon: User },
  { key: 'nav.apply', name: 'Admission Form', path: '/application', icon: FileText, badge: 'Open' },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = navLinksConfig.map((item) => ({
    ...item,
    name: t(item.key, item.name),
  }));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="w-full sticky top-0 z-50 bg-background/98 backdrop-blur-md shadow-md border-b border-border/80">
      {/* Top Header Bar */}
      <div className="border-b border-border/60 bg-primary/[0.03] py-2 px-4 md:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white shadow-sm border border-border/80 p-0.5 group-hover:scale-105 transition-all duration-200 shrink-0 overflow-hidden">
              <img 
                src={schoolLogo} 
                alt="Bal Vikas Public School Kalayat Official Logo" 
                className="h-full w-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold leading-none text-primary group-hover:text-secondary transition-colors">BVPS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary tracking-wider uppercase">Kalayat</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Est. 2004
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wide mt-0.5">Bal Vikas Public School • District Kaithal</span>
            </div>
          </Link>

          {/* Quick Info & Action on Top Bar + Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="tel:+919812550200" 
              className="hidden xl:flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors bg-white px-3 py-1.5 rounded-full border border-border shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>+91 98125 50200</span>
            </a>

            <Link
              href="/fee-structure"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              {t('nav.fees', 'Fee Structure')}
            </Link>

            <Link
              href="/application"
              className="inline-flex items-center justify-center h-8 sm:h-9 px-3.5 sm:px-4 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all"
            >
              {t('nav.apply', 'Apply Online')}
            </Link>

            {/* Language Switcher in Upper Corner */}
            <LanguageSwitcher />

            {/* Mobile menu toggle */}
            <button 
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors ml-1" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Links (Desktop Bar) */}
      <div className="hidden lg:block bg-background py-1.5 px-4 md:px-6 overflow-x-auto scrollbar-thin">
        <div className="container mx-auto">
          <nav className="flex items-center justify-between gap-1 xl:gap-2 whitespace-nowrap min-w-max">
            {navLinks.map((link) => {
              const isActive = location === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : link.highlight
                      ? 'text-primary bg-primary/5 hover:bg-primary/15 font-bold'
                      : 'text-foreground/80 hover:text-primary hover:bg-gray-100/80'
                  }`}
                >
                  <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-secondary' : 'opacity-70'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive ? 'bg-secondary text-primary' : 'bg-secondary/20 text-secondary-foreground font-bold'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-h-[80vh] overflow-y-auto bg-background border-t border-border shadow-2xl py-3 px-4 flex flex-col gap-1 z-50">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 mb-1">
            All School Pages
          </div>
          {navLinks.map((link) => {
            const isActive = location === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-xs'
                    : 'text-foreground/85 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isActive ? 'bg-secondary text-primary' : 'bg-secondary/25 text-primary'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
            <Link
              href="/application"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-full items-center justify-center h-11 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-xl text-sm shadow-xs transition-colors"
            >
              Apply for Admission 2025–26
            </Link>
            <a
              href="tel:+919812550200"
              className="inline-flex w-full items-center justify-center gap-2 h-10 bg-primary/10 text-primary font-semibold rounded-xl text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call School Helpline (+91 98125 50200)
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

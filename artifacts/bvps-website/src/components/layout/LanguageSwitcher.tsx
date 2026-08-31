import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES, Language } from '@/lib/language-context';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left notranslate ${className}`} ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full border border-border/80 shadow-2xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-secondary/40 notranslate"
        aria-expanded={isOpen}
        aria-label="Select website language"
      >
        <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
        <span className="hidden xs:inline-block font-semibold notranslate">{currentLang.nativeName}</span>
        <span className="xs:hidden uppercase tracking-wider notranslate">{currentLang.code}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white shadow-xl border border-border/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 notranslate">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1 notranslate">
            Choose Language / भाषा
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors notranslate ${
                  isSelected
                    ? 'bg-secondary/15 text-primary font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 notranslate">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <p className="font-semibold leading-tight notranslate">{lang.nativeName}</p>
                    <p className="text-[10px] text-muted-foreground notranslate">{lang.label}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

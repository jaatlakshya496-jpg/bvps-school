import { ReactNode, useEffect } from 'react';
import { FloatingContact } from './FloatingContact';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';
import { SeoBase, SchoolStructuredData } from '@/lib/seo';
import { useSiteContent } from '@/lib/site-content';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

export function RootLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { get } = useSiteContent();
  // Admin portal → School Information se set hota hai. Khaali ho toh bar hi nahi
  // dikhta — isliye owner "notice" ko kabhi bhi band kar sakta hai.
  const announcement = get('site.announcement', '').trim();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans text-foreground">
      {/* Site-wide fallback social/meta tags + School JSON-LD — har page par
          `twitter:*`/`og:site_name` yahin se guaranteed milte hain, aur page
          apna `og:title`/`og:description` inke upar override kar deta hai. */}
      <SeoBase />
      <SchoolStructuredData />

      {/* Keyboard users ke liye skip link — pehle kahin nahi tha */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      {/* Sticky header: top info bar + navbar together */}
      <div className="sticky top-0 z-50">
        {announcement && (
          <div
            role="status"
            className="bg-secondary text-primary text-center text-xs sm:text-sm font-semibold px-4 py-2 leading-snug"
          >
            {announcement}
          </div>
        )}
        <FloatingContact />
        <Navbar />
      </div>
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatbotWidget />
      <WhatsAppButton />
    </div>
  );
}

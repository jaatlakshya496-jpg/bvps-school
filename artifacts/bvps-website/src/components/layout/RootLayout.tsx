import { ReactNode, useEffect } from 'react';
import { FloatingContact } from './FloatingContact';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';
import { UnifiedAiAgent } from '@/components/voice-bot/UnifiedAiAgent';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

export function RootLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans text-foreground">
      {/* Sticky header: top info bar + navbar together */}
      <div className="sticky top-0 z-50">
        <FloatingContact />
        <Navbar />
      </div>
      <main className="flex-1">
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
      <UnifiedAiAgent />
      <WhatsAppButton />
    </div>
  );
}

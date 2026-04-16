import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SHOW_THRESHOLD_PX = 600;

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_THRESHOLD_PX);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Scroll to top"
          data-testid="scroll-to-top"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center
                     w-10 h-10 rounded border border-brand-primary/40
                     bg-brand-bg/80 backdrop-blur-sm font-mono text-brand-primary
                     hover:border-brand-primary hover:bg-brand-primary/10
                     transition-colors select-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <span aria-hidden="true" className="text-lg leading-none">^</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;

import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion, motion, AnimatePresence } from 'framer-motion';
import type { BentoBlock, HeroContent } from 'shared/types';
import StaticProfileCard from './StaticProfileCard';

// Timing constants — mobile completes all lines in <1s total; desktop 80ms per line
const DESKTOP_INTERVAL_MS = 80;
const MOBILE_TOTAL_MS = 1000;

function getIntervalMs(lineCount: number): number {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return Math.floor(MOBILE_TOTAL_MS / lineCount);
  }
  return DESKTOP_INTERVAL_MS;
}

export interface HeroProps {
  data: BentoBlock & { content: HeroContent };
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  const prefersReducedMotion = useReducedMotion();
  const lines = data.content.lines;

  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    // If reduced motion is active, we render StaticProfileCard — no boot sequence needed
    if (prefersReducedMotion) return;

    const interval = getIntervalMs(lines.length);
    indexRef.current = 0;
    setVisibleLines([]);
    setComplete(false);

    const timer = setInterval(() => {
      const next = indexRef.current;
      if (next < lines.length) {
        setVisibleLines((prev) => [...prev, lines[next]]);
        indexRef.current += 1;
      } else {
        setComplete(true);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [lines, prefersReducedMotion]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) setHasScrolled(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (prefersReducedMotion) {
    return <StaticProfileCard lines={lines} />;
  }

  return (
    <div
      role="region"
      aria-label="Introduction"
      className="h-screen flex flex-col items-center justify-center bg-brand-bg px-6 relative"
      data-testid="hero"
    >
      <div className="font-mono text-brand-text w-full max-w-2xl space-y-1">
        <div className="text-brand-primary text-xs mb-4 select-none">
          {'$ boot'}
        </div>
        <AnimatePresence>
          {visibleLines.map((line, i) => (
            <motion.p
              key={i}
              data-testid={`boot-line-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="text-brand-text leading-relaxed"
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>

        {!complete && (
          <span
            className="inline-block w-2 h-4 bg-brand-primary animate-pulse"
            data-testid="cursor"
            aria-hidden="true"
          />
        )}
      </div>

      {complete && !hasScrolled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 select-none"
          aria-hidden="true"
        >
          <span className="font-mono text-sm text-brand-primary tracking-widest">
            {'> scroll to explore'}
          </span>
          <motion.span
            className="text-brand-primary text-xl"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </div>
  );
};

export default Hero;

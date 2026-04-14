import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { BentoBlock, HeroContent } from 'shared/types';
import Hero from '../Hero/Hero';
import BentoGrid from '../BentoGrid/BentoGrid';

/** Scroll threshold in pixels — crossing this hides the Hero and shows the BentoGrid */
export const SCROLL_THRESHOLD_PX = 80;

/** Stagger delay between BentoGrid appearing and its content animating in */
const BENTO_STAGGER_DELAY_S = 0.15;

export interface ScrollTransitionOrchestratorProps {
  heroBlock: BentoBlock & { content: HeroContent };
  blocks: BentoBlock[];
  /**
   * Optional external showHero control — when provided the orchestrator
   * uses this value directly and does NOT register its own scroll listener.
   * This allows App.tsx to lift the state and share it with NavBar.
   */
  showHero?: boolean;
}

/**
 * ScrollTransitionOrchestrator — Option B implementation.
 *
 * Uses AnimatePresence to coordinate:
 *   - Hero exits with opacity/translateY when scroll threshold crossed
 *   - BentoGrid staggers in with a coordinated delay after Hero exits
 *
 * No layoutId is used — this is intentional per architecture spec.
 * Respects prefers-reduced-motion via Framer Motion useReducedMotion().
 */
const ScrollTransitionOrchestrator: React.FC<ScrollTransitionOrchestratorProps> = ({
  heroBlock,
  blocks,
  showHero: externalShowHero,
}) => {
  const [internalShowHero, setInternalShowHero] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Only manage scroll internally if no external showHero is provided
  const isExternallyControlled = externalShowHero !== undefined;
  const showHero = isExternallyControlled ? externalShowHero : internalShowHero;

  // Scroll listener — only registered when not externally controlled
  useEffect(() => {
    if (isExternallyControlled) return;

    const handleScroll = () => {
      const pastThreshold = window.scrollY > SCROLL_THRESHOLD_PX;
      setInternalShowHero(!pastThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case the page loads already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isExternallyControlled]);

  // When reduced-motion is active, skip all transitions — render both directly
  if (prefersReducedMotion) {
    return (
      <div>
        {showHero ? (
          <Hero data={heroBlock} />
        ) : (
          <BentoGrid blocks={blocks} />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait" onExitComplete={() => { if (!showHero) window.scrollTo({ top: 0 }); }}>
        {showHero ? (
          // Hero — visible while user is at top of page
          <motion.div
            key="hero"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -40,
              transition: { duration: 0.35, ease: 'easeInOut' },
            }}
          >
            <Hero data={heroBlock} />
            {/* Scroll affordance — gives the page enough height to scroll past the threshold */}
            <div className="h-24 bg-brand-bg" />
          </motion.div>
        ) : (
          // BentoGrid — staggers in after Hero exits
          <motion.div
            key="bento-grid"
            initial={{ opacity: 0, y: 32 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: 'easeOut',
                delay: BENTO_STAGGER_DELAY_S,
              },
            }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
          >
            <BentoGrid blocks={blocks} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollTransitionOrchestrator;

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { BentoBlock, HeroContent } from 'shared/types';
import Hero from '../Hero/Hero';
import BentoGrid from '../BentoGrid/BentoGrid';

/** Scroll threshold in pixels — used by App.tsx to flip NavBar visibility */
export const SCROLL_THRESHOLD_PX = 80;

/** Fraction of viewport height over which the Hero fades out (0.6 = faded by 60vh of scroll) */
const FADE_RANGE = 0.6;

export interface ScrollTransitionOrchestratorProps {
  heroBlock: BentoBlock & { content: HeroContent };
  blocks: BentoBlock[];
  /** Unused — kept for backward-compat with existing callers */
  showHero?: boolean;
}

/**
 * ScrollTransitionOrchestrator — scroll-linked fade.
 *
 * Hero sits in normal document flow (h-screen) above BentoGrid. As the user
 * scrolls, Hero's opacity is tied directly to scrollY via useTransform, so
 * every pixel of wheel/trackpad delta produces a proportional visual change.
 * No state flip, no momentum-induced jumps past the first grid section.
 *
 * Reduced-motion users skip the fade and see BentoGrid directly.
 */
const ScrollTransitionOrchestrator: React.FC<ScrollTransitionOrchestratorProps> = ({
  heroBlock,
  blocks,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const [vh, setVh] = useState(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight,
  );
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const opacity = useTransform(scrollY, [0, vh * FADE_RANGE], [1, 0]);

  if (prefersReducedMotion) {
    return <BentoGrid blocks={blocks} />;
  }

  return (
    <div className="relative bg-brand-bg">
      <motion.div style={{ opacity }}>
        <Hero data={heroBlock} />
      </motion.div>
      <BentoGrid blocks={blocks} />
    </div>
  );
};

export default ScrollTransitionOrchestrator;

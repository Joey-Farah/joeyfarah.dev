import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { BentoBlock, HeroContent } from 'shared/types';
import Hero from '../Hero/Hero';
import BentoGrid from '../BentoGrid/BentoGrid';

/** Fraction of viewport height over which the Hero fades out (0.6 = faded by 60vh of scroll) */
const FADE_RANGE = 0.6;

export interface ScrollTransitionOrchestratorProps {
  heroBlock: BentoBlock & { content: HeroContent };
  blocks: BentoBlock[];
  /** Rendered between the hero and the bento grid — e.g. the orientation intro */
  afterHero?: React.ReactNode;
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
  afterHero,
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
    return (
      <>
        {afterHero}
        <BentoGrid blocks={blocks} />
      </>
    );
  }

  return (
    <div className="relative bg-brand-bg">
      <motion.div style={{ opacity }}>
        <Hero data={heroBlock} />
      </motion.div>
      {afterHero}
      <BentoGrid blocks={blocks} />
    </div>
  );
};

export default ScrollTransitionOrchestrator;

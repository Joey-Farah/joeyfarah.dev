import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * IntroSection — the "who I am" block, shown first on scroll (after the hero,
 * before the bento grid). It introduces Joey across his lanes — consulting,
 * building, competing — so a visitor gets the range before the proof below.
 */
const IntroSection: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <motion.section
      id="joey"
      aria-labelledby="joey-heading"
      className="max-w-3xl mx-auto px-6 py-12 md:py-16"
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-brand-primary text-sm mb-4 font-mono" aria-hidden="true">
        {'$ whoami'}
      </p>
      <h2
        id="joey-heading"
        className="font-mono text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        One person, a few <span className="text-brand-primary">obsessions</span>.
      </h2>
      <p className="mt-6 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        By day, an Oracle Cloud consultant — seven years in.
      </p>
      <p className="mt-3 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        Off the clock, I build my own things: desktop apps, tools, a database engine
        from scratch — usually just to see how something works.
      </p>
      <p className="mt-3 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        And, for years, a top-ranked{' '}
        <span className="italic">Super Smash Bros. Melee</span> player — #61 in the world.
      </p>
    </motion.section>
  );
};

export default IntroSection;

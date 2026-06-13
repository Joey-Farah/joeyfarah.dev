import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// How I work — the same scope/build/ship line that used to sit in the close.
// It belongs up top now: it's orientation, not conversion.
const STEPS = [
  { cmd: 'scope', line: 'the smallest finished thing that solves it.' },
  { cmd: 'build', line: 'end to end. Links to click, not status meetings.' },
  { cmd: 'ship', line: 'a live product. Not a prototype.' },
] as const;

/**
 * IntroSection — the orientation block, shown first on scroll (after the hero,
 * before the bento grid). It tells a visitor what this site is before the proof
 * below backs it up. The conversion half (stats, invite, CTA, contact) lives in
 * WorkSection at the bottom of the page.
 */
const IntroSection: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <motion.section
      id="joey"
      aria-labelledby="joey-heading"
      className="max-w-3xl mx-auto px-6 py-16 md:py-24"
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-brand-primary text-sm mb-4 font-mono" aria-hidden="true">
        {'$ joey'}
      </p>
      <h2
        id="joey-heading"
        className="font-mono text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        I design, build, and <span className="text-brand-primary">ship</span> software.
      </h2>
      <p className="mt-4 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        Generating code is easy now. The hard parts moved upstream — discovery,
        requirements, design: understanding the problem before trying to solve
        it. That, and the last 20%, where it actually ships.
      </p>
      <p className="mt-3 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        So I work in vertical slices — thin, end-to-end pieces that run. You
        get something usable early, real software to react to, not a plan and
        a long wait. Everything below is my own work, built that way.
      </p>

      {/* process — one line */}
      <p className="mt-8 font-mono text-sm text-brand-text/85">
        {STEPS.map((s, i) => (
          <span key={s.cmd}>
            <span className="text-brand-primary font-bold">{s.cmd}</span>
            {' — '}
            {s.line}
            {i < STEPS.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </motion.section>
  );
};

export default IntroSection;

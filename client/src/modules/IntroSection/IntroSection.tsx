import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';

// Range stats — they back up the "who I am" intro (moved here from the contact
// section, where they read as a pitch rather than context).
const STATS: ReadonlyArray<{
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}> = [
  { value: 7, suffix: 'yrs', label: 'enterprise Oracle Cloud' },
  { value: 6, suffix: '+', label: 'products shipped' },
  { value: 50, suffix: '+', label: 'Patreon supporters' },
  { value: 61, prefix: '#', label: 'world ranking, SSBMRank 2025' },
];

/** Counts up to `target` when scrolled into view; static under reduced motion. */
const CountUp: React.FC<{ target: number; prefix?: string; suffix?: string }> = ({
  target,
  prefix = '',
  suffix = '',
}) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, reduce]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
};

/**
 * IntroSection — the "who I am" block, shown first on scroll (after the hero,
 * before the bento grid). Introduces Joey across his lanes and backs it with a
 * few range stats.
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
        {'$ me'}
      </p>
      <h2
        id="joey-heading"
        className="font-mono text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        Hi, I&apos;m <span className="text-brand-primary">Joey</span>
      </h2>
      <p className="mt-6 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        By day, Oracle Cloud consulting — seven years in. By night, my own software:
        apps, tools, a database engine from scratch. And for years, competitive{' '}
        <span className="italic">Super Smash Bros. Melee</span> — #61 in the world.
      </p>

      {/* range stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-primary/15 border border-brand-primary/15 rounded overflow-hidden font-mono">
        {STATS.map((s) => (
          <div key={s.label} className="bg-brand-bg p-4">
            <div className="text-2xl md:text-3xl font-bold text-brand-primary">
              <CountUp target={s.value} prefix={'prefix' in s ? s.prefix : ''} suffix={'suffix' in s ? s.suffix : ''} />
            </div>
            <div className="mt-1 text-[11px] leading-snug text-brand-text/75">{s.label}</div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default IntroSection;

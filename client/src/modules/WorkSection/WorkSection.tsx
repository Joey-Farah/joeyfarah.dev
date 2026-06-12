import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';

// Cloudflare Email Routing alias — forwards to the real inbox. Disposable by
// design: if it ever draws spam, rotate the alias and redeploy.
const CONTACT_EMAIL = 'hello@joeyfarah.dev';

const STATS = [
  { value: 61, prefix: '#', label: 'world ranking, SSBMRank 2025' },
  { value: 7, suffix: 'yrs', label: 'enterprise Oracle Cloud' },
  { value: 6, suffix: '+', label: 'products shipped' },
  { value: 1, label: 'person, every layer' },
] as const;

const SHAPES = [
  { flag: '--mvp', line: 'Idea → deployed product. Not a demo.' },
  { flag: '--tool', line: 'Desktop & internal tools. Installer included.' },
  { flag: '--dashboard', line: 'Scattered data, made legible and live.' },
] as const;

const STEPS = [
  { cmd: 'scope', line: 'the smallest finished thing that solves it.' },
  { cmd: 'build', line: 'end to end. Links to click, not status meetings.' },
  { cmd: 'ship', line: 'a live product. Not a prototype.' },
] as const;

const CONTACT_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joey-farah/' },
  { label: 'GitHub', href: 'https://github.com/Joey-Farah' },
  { label: 'Discord', href: 'https://discord.com/users/101538614428602368' },
  { label: 'YouTube', href: 'https://www.youtube.com/@joeydonutsssbm' },
] as const;

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
 * WorkSection — the dev-for-hire close at the bottom of the single-page site.
 * The bento grid above it is the proof; this section only frames the offer
 * and lands the CTA. /work redirects here.
 */
const WorkSection: React.FC = () => {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    void navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.section
      id="work"
      aria-labelledby="work-heading"
      className="max-w-3xl mx-auto px-6 py-16 md:py-24"
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-brand-primary text-sm mb-4 font-mono" aria-hidden="true">
        {'$ ./work --with joey'}
      </p>
      <h2
        id="work-heading"
        className="font-mono text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        I design, build, and ship software —{' '}
        <span className="text-brand-primary">all of it.</span>
      </h2>
      <p className="mt-4 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        Generating code is easy now. The expensive part is the last 20% —
        where it actually ships. Everything above is my own work, end to end.
      </p>

      {/* stats */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-primary/15 border border-brand-primary/15 rounded overflow-hidden font-mono">
        {STATS.map((s) => (
          <div key={s.label} className="bg-brand-bg p-4">
            <div className="text-2xl md:text-3xl font-bold text-brand-primary">
              <CountUp target={s.value} prefix={'prefix' in s ? s.prefix : ''} suffix={'suffix' in s ? s.suffix : ''} />
            </div>
            <div className="mt-1 text-[11px] leading-snug text-brand-text/75">{s.label}</div>
          </div>
        ))}
      </div>

      {/* shapes */}
      <div className="mt-8 grid md:grid-cols-3 gap-3 font-mono">
        {SHAPES.map((s) => (
          <div key={s.flag} className="border border-brand-primary/20 rounded-lg p-3.5 hover:border-brand-primary/50 transition-colors duration-200">
            <span className="text-brand-primary text-sm font-bold">{s.flag}</span>
            <p className="mt-1.5 text-xs leading-relaxed text-brand-text/85">{s.line}</p>
          </div>
        ))}
      </div>

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

      {/* CTA */}
      <div className="mt-10 border border-brand-primary/30 rounded-lg p-6 md:p-8 text-center bg-brand-primary/[0.03] font-mono">
        <p className="text-brand-text/85 text-sm mb-5">
          Have a problem that needs a finished thing?
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          onClick={handleEmailClick}
          data-testid="work-cta"
          aria-label={copied ? 'Email copied to clipboard' : `Email ${CONTACT_EMAIL}`}
          className="inline-block border border-brand-primary/50 rounded px-6 py-3 text-sm text-brand-primary
                     hover:bg-brand-primary/10 hover:shadow-[0_0_24px_rgba(6,182,212,0.25)]
                     transition-all duration-200"
        >
          {copied ? '✓ copied to clipboard' : (
            <>
              {'$ mail '}
              {CONTACT_EMAIL}
              <span className="animate-pulse" aria-hidden="true">{' ▊'}</span>
            </>
          )}
        </a>
        <p className="mt-3 text-[11px] text-brand-text/60">
          one email. no forms, no calendly maze.
        </p>
        <div className="mt-5 pt-4 border-t border-brand-primary/15 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {CONTACT_LINKS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-primary underline underline-offset-2
                         decoration-brand-primary/40 hover:decoration-brand-primary
                         transition-colors duration-150"
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default WorkSection;

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';

// Cloudflare Email Routing alias — forwards to the real inbox. Disposable by
// design: if it ever draws spam, rotate the alias and redeploy.
const CONTACT_EMAIL = 'hello@joeyfarah.dev';

// Ranking goes last — it matters less than the shipping stats.
const STATS: ReadonlyArray<{
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}> = [
  { value: 7, suffix: 'yrs', label: 'enterprise Oracle Cloud' },
  { value: 6, suffix: '+', label: 'products shipped' },
  { value: 50, suffix: '+', label: 'paid Patreon supporters' },
  { value: 61, prefix: '#', label: 'world ranking, SSBMRank 2025' },
];

// Full-width caption under the grid — inside a cell it wrecked the row heights.
const STATS_QUIP = '(being globally ranked at anything has to be impressive, right?)';

const SHAPES = [
  { flag: '--mvp', line: 'Idea → deployed product. Not a demo.' },
  { flag: '--tool', line: 'Desktop & internal tools. Installer included.' },
  { flag: '--dashboard', line: 'Scattered data, made legible and live.' },
] as const;

// The old contact tile, absorbed — same `$ open <display>` rows it had.
const CONTACT_LINKS = [
  { platform: 'LinkedIn', display: 'linkedin.com/in/joey-farah', href: 'https://www.linkedin.com/in/joey-farah/' },
  { platform: 'GitHub', display: 'github.com/Joey-Farah', href: 'https://github.com/Joey-Farah' },
  { platform: 'Discord', display: 'discord: joeydonuts', href: 'https://discord.com/users/101538614428602368' },
  { platform: 'YouTube', display: 'youtube.com/@joeydonutsssbm', href: 'https://www.youtube.com/@joeydonutsssbm' },
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
 * WorkSection — the "build" section. Sits second (right after IntroSection) so
 * the page order matches the nav; orientation lives up top in IntroSection and
 * the proof (projects, timeline, personal) follows below. This section makes the
 * invite and lands the CTA. /work, /hire, and /build all redirect here.
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
      id="build"
      aria-labelledby="build-heading"
      className="max-w-3xl mx-auto px-6 py-16 md:py-24"
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-brand-primary text-sm mb-4 font-mono" aria-hidden="true">
        {'$ ./build --with-me'}
      </p>
      {/* The warm invite is the heading now — collaborator framing, not a pitch. */}
      <h2
        id="build-heading"
        className="font-mono text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        Got something you want <span className="text-brand-primary">built</span>?
      </h2>
      <p className="mt-4 font-mono text-sm md:text-base text-brand-text/85 max-w-xl">
        A product, a tool, an idea you keep wishing existed — tell me about it.
      </p>

      {/* shapes — the kinds of things I build */}
      <div className="mt-8 grid md:grid-cols-3 gap-3 font-mono">
        {SHAPES.map((s) => (
          <div key={s.flag} className="border border-brand-primary/20 rounded-lg p-3.5 hover:border-brand-primary/50 transition-colors duration-200">
            <span className="text-brand-primary text-sm font-bold">{s.flag}</span>
            <p className="mt-1.5 text-xs leading-relaxed text-brand-text/85">{s.line}</p>
          </div>
        ))}
      </div>

      {/* stats — the proof I deliver */}
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
      <p className="mt-2 text-right font-mono text-[11px] italic text-brand-text/60">
        {STATS_QUIP}
      </p>

      {/* CTA */}
      <div className="mt-10 border border-brand-primary/30 rounded-lg p-6 md:p-8 text-center bg-brand-primary/[0.03] font-mono">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          onClick={handleEmailClick}
          data-testid="hire-cta"
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
      </div>

      {/* contact — the old contact tile lives here now */}
      <div className="mt-8 font-mono text-sm" role="list" aria-label="Contact links">
        {CONTACT_LINKS.map((c) => (
          <div key={c.platform} className="flex items-center gap-2 py-1.5" role="listitem">
            <span className="text-brand-primary select-none shrink-0" aria-hidden="true">{'$'}</span>
            <span className="text-brand-text/75 select-none shrink-0" aria-hidden="true">{'open'}</span>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.platform}
              className="text-brand-primary underline underline-offset-2
                         decoration-brand-primary/40 hover:decoration-brand-primary
                         transition-colors duration-150"
            >
              {c.display}
            </a>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default WorkSection;

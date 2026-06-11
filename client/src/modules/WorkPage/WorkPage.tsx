import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  animate,
} from 'framer-motion';

const CONTACT_EMAIL = 'joeyefarah@gmail.com';

/* ────────────────────────────────────────────────────────────────────────────
   Content — own work only. Never Elire client detail (NDA).
──────────────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: 61, prefix: '#', label: 'world ranking, SSBMRank 2025' },
  { value: 7, suffix: 'yrs', label: 'enterprise Oracle Cloud' },
  { value: 6, suffix: '+', label: 'products shipped' },
  { value: 1, label: 'person, every layer' },
] as const;

/** Deep proof — ship-log format: problem → built → result. */
const SHIP_LOGS = [
  {
    cmd: 'open joeyfarah.dev',
    name: 'joeyfarah.dev',
    problem: 'A resume PDF can’t prove someone ships. A link list can’t either.',
    built:
      'Full-stack visual resume — terminal boot, bento grid, scroll-driven ERD ' +
      'drawn from real backend data. React, Express, MongoDB, typed end to end, ' +
      'content validated at ingest so a bad edit can’t reach production.',
    result:
      'You’re looking at it. ~92 kB over the wire, WCAG AA, Lighthouse CI on ' +
      'every push. The site is its own receipt.',
    stack: ['React', 'TypeScript', 'Express', 'MongoDB', 'Railway'],
    links: [
      { label: 'view source', href: 'https://github.com/Joey-Farah/joeyfarah.dev', external: true },
    ],
  },
  {
    cmd: 'open slippi-ranked-stats',
    name: 'Slippi Ranked Stats',
    problem:
      'Competitive Melee players generate thousands of replay files and learn ' +
      'almost nothing from them.',
    built:
      'Desktop app that parses ranked replays into matchup spreads, stage win ' +
      'rates, and season trends — fast enough to feel instant on a normal laptop.',
    result:
      'Shipped, free, in the scene’s hands. Built it for my own ranked grind ' +
      'before retiring at #61 in the world.',
    stack: ['Desktop', 'Data pipeline', 'Shipped'],
    links: [
      { label: 'GitHub', href: 'https://github.com/Joey-Farah/Slippi-Ranked-Stats', external: true },
      { label: 'download', href: 'https://github.com/Joey-Farah/Slippi-Ranked-Stats/releases/latest', external: true },
    ],
  },
] as const;

/** Compact proof — `ls` style. */
const ALSO_SHIPPED = [
  // External where a public artifact exists; home anchors otherwise — never a dead link.
  { name: 'TrendArc', line: 'fitness biometrics, made legible — live app', href: 'https://trendarc.app', external: true },
  { name: 'Oracle Cloud tooling', line: 'ERD explorer + conversion & SQL toolkits', href: '/#oracle-db-diagram', external: false },
  { name: 'Spotify to MP3', line: 'Windows desktop downloader', href: '/#spotify-to-mp3', external: false },
] as const;

const SHAPES = [
  {
    flag: '--mvp',
    title: 'Idea → deployed product',
    line: 'Design, build, ship. A real MVP users can touch — not a prototype, not a handoff doc.',
  },
  {
    flag: '--tool',
    title: 'Desktop & internal tools',
    line: 'The data-heavy workhorses a team opens every day. Installer included, finish included.',
  },
  {
    flag: '--dashboard',
    title: 'Dashboards & pipelines',
    line: 'Scattered data made legible and live — ingest, transform, visualize, deploy.',
  },
] as const;

const STEPS = [
  { cmd: 'scope', line: 'We define the problem and the smallest finished thing that solves it.' },
  { cmd: 'build', line: 'I design and build it end to end — frontend, backend, data, deploy.' },
  { cmd: 'ship', line: 'You get a live, working product. Then we decide what’s next.' },
] as const;

/* ────────────────────────────────────────────────────────────────────────────
   Motion primitives
──────────────────────────────────────────────────────────────────────────── */

/** Types out `text` character by character; renders instantly under reduced motion. */
function useTypewriter(text: string, speedMs = 45, startDelayMs = 250): string {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? text : '');

  useEffect(() => {
    if (reduce) {
      setShown(text);
      return;
    }
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speedMs);
    }, startDelayMs);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs, reduce]);

  return shown;
}

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

/** Section reveal — children stagger up as the block scrolls into view. */
const sectionVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const Reveal: React.FC<{ children: React.ReactNode; className?: string; ariaLabelledBy?: string }> = ({
  children,
  className,
  ariaLabelledBy,
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className={className}
      aria-labelledby={ariaLabelledBy}
      variants={reduce ? undefined : sectionVariants}
      initial={reduce ? undefined : 'hidden'}
      whileInView={reduce ? undefined : 'show'}
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.section>
  );
};

const Item: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : itemVariants}>
      {children}
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   WorkPage — /work. A terminal session that sells: the page itself is the
   first proof of "I ship polished, finished things."
──────────────────────────────────────────────────────────────────────────── */

const WorkPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const typedCmd = useTypewriter('./work --with joey');

  useEffect(() => {
    document.title = 'Work with me — joeyfarah.dev';
  }, []);

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    void navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-bg text-brand-text font-mono">
      {/* Atmosphere — faint cyan glow + dot grid, no solid-color flatness */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6,182,212,0.10), transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgba(226,232,240,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Back home */}
        <a
          href="/"
          aria-label="Back to joeyfarah.dev home"
          className="text-xs text-brand-text/50 hover:text-brand-primary transition-colors duration-150"
        >
          {'$ cd ~'}
        </a>

        {/* ── Hero: the typed command, then its "output" ─────────────────── */}
        <header className="mt-12 md:mt-20">
          <p className="text-brand-primary text-sm mb-5 h-5" aria-hidden="true">
            {'$ '}
            {typedCmd}
            <span className="animate-pulse">▊</span>
          </p>
          <motion.h1
            className="text-3xl md:text-5xl font-bold leading-tight tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            I take a real problem and{' '}
            <span className="text-brand-primary">ship the finished thing.</span>
          </motion.h1>
          <motion.p
            className="mt-5 text-brand-text/70 text-sm md:text-base leading-relaxed max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            End to end, solo — design, frontend, backend, data, deploy. Anyone
            can generate code. The rare part is the finish: a polished, live
            product someone actually uses.
          </motion.p>
        </header>

        {/* ── Credibility readout ────────────────────────────────────────── */}
        <Reveal className="mt-14 md:mt-20" ariaLabelledBy="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Credentials
          </h2>
          <Item>
            <p className="text-brand-primary/60 text-xs mb-4" aria-hidden="true">
              {'$ stats --joey'}
            </p>
          </Item>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-primary/15 border border-brand-primary/15 rounded overflow-hidden">
            {STATS.map((s) => (
              <Item key={s.label} className="bg-brand-bg p-4 md:p-5">
                <div className="text-2xl md:text-3xl font-bold text-brand-primary">
                  <CountUp target={s.value} prefix={'prefix' in s ? s.prefix : ''} suffix={'suffix' in s ? s.suffix : ''} />
                </div>
                <div className="mt-1 text-[11px] leading-snug text-brand-text/50">{s.label}</div>
              </Item>
            ))}
          </div>
        </Reveal>

        {/* ── Deep proof: ship logs ──────────────────────────────────────── */}
        <Reveal className="mt-16 md:mt-24" ariaLabelledBy="proof-heading">
          <Item>
            <h2 id="proof-heading" className="text-brand-primary text-sm mb-6">
              {'// proof — things I shipped, all mine'}
            </h2>
          </Item>
          <div className="space-y-6">
            {SHIP_LOGS.map((log) => (
              <Item key={log.name}>
                <article className="group border border-brand-primary/20 rounded-lg overflow-hidden transition-colors duration-200 hover:border-brand-primary/50">
                  {/* terminal chrome */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-brand-primary/15 bg-brand-primary/[0.04]">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="w-2 h-2 rounded-full bg-brand-text/15" />
                      <span className="w-2 h-2 rounded-full bg-brand-text/15" />
                      <span className="w-2 h-2 rounded-full bg-brand-primary/40" />
                    </span>
                    <span className="text-xs text-brand-text/40" aria-hidden="true">
                      {'$ '}
                      {log.cmd}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base md:text-lg font-bold text-brand-text">{log.name}</h3>
                    <dl className="mt-3 space-y-2.5 text-sm leading-relaxed">
                      <div className="flex gap-3">
                        <dt className="shrink-0 text-brand-primary/70 w-16 text-xs pt-0.5 uppercase tracking-wider">problem</dt>
                        <dd className="text-brand-text/75">{log.problem}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="shrink-0 text-brand-primary/70 w-16 text-xs pt-0.5 uppercase tracking-wider">built</dt>
                        <dd className="text-brand-text/75">{log.built}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="shrink-0 text-brand-primary w-16 text-xs pt-0.5 uppercase tracking-wider">result</dt>
                        <dd className="text-brand-text">{log.result}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {log.stack.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider text-brand-text/40 border border-brand-text/10 rounded px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="ml-auto flex items-center gap-3">
                        {log.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="text-xs text-brand-primary underline underline-offset-2 decoration-brand-primary/40 group-hover:decoration-brand-primary transition-colors duration-150"
                          >
                            {l.label} {'→'}
                          </a>
                        ))}
                      </span>
                    </div>
                  </div>
                </article>
              </Item>
            ))}
          </div>

          {/* compact proof */}
          <Item className="mt-6">
            <p className="text-brand-primary/60 text-xs mb-3" aria-hidden="true">
              {'$ ls also-shipped/'}
            </p>
            <ul className="space-y-1.5 text-sm">
              {ALSO_SHIPPED.map((p) => (
                <li key={p.name} className="flex gap-2 items-baseline">
                  <span className="text-brand-primary select-none" aria-hidden="true">{'>'}</span>
                  <a
                    href={p.href}
                    {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="text-brand-primary underline underline-offset-2 decoration-brand-primary/30 hover:decoration-brand-primary transition-colors duration-150"
                  >
                    {p.name}
                  </a>
                  <span className="text-brand-text/50">— {p.line}</span>
                </li>
              ))}
            </ul>
          </Item>

          <Item>
            <p className="mt-6 text-xs text-brand-text/40 leading-relaxed">
              {'// day job: Oracle Cloud technical consultant, 7 years. '}
              {'that work stays at work — everything above is my own.'}
            </p>
          </Item>
        </Reveal>

        {/* ── Engagement shapes ──────────────────────────────────────────── */}
        <Reveal className="mt-16 md:mt-24" ariaLabelledBy="shapes-heading">
          <Item>
            <h2 id="shapes-heading" className="text-brand-primary text-sm mb-6">
              {'// what hiring me looks like'}
            </h2>
          </Item>
          <div className="grid md:grid-cols-3 gap-4">
            {SHAPES.map((s) => (
              <Item key={s.flag}>
                <div className="h-full border border-brand-primary/20 rounded-lg p-4 transition-all duration-200 hover:border-brand-primary/50 hover:-translate-y-0.5">
                  <div className="text-brand-primary text-sm font-bold">{s.flag}</div>
                  <div className="mt-1.5 text-sm font-bold text-brand-text">{s.title}</div>
                  <p className="mt-2 text-xs leading-relaxed text-brand-text/60">{s.line}</p>
                </div>
              </Item>
            ))}
          </div>
        </Reveal>

        {/* ── Process ────────────────────────────────────────────────────── */}
        <Reveal className="mt-16 md:mt-24" ariaLabelledBy="how-heading">
          <Item>
            <h2 id="how-heading" className="text-brand-primary text-sm mb-6">
              {'// how it works'}
            </h2>
          </Item>
          <ol className="relative space-y-5 text-sm md:text-base">
            {STEPS.map((s, i) => (
              <Item key={s.cmd}>
                <li className="flex gap-4">
                  <span className="shrink-0 w-7 h-7 rounded border border-brand-primary/40 text-brand-primary flex items-center justify-center text-xs font-bold" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pt-1">
                    <span className="text-brand-primary font-bold">{s.cmd}</span>
                    <span className="text-brand-text/75"> — {s.line}</span>
                  </span>
                </li>
              </Item>
            ))}
          </ol>
        </Reveal>

        {/* ── Single CTA: a live prompt ──────────────────────────────────── */}
        <Reveal className="mt-16 md:mt-28 mb-12" ariaLabelledBy="cta-heading">
          <h2 id="cta-heading" className="sr-only">
            Get in touch
          </h2>
          <Item>
            <div className="border border-brand-primary/30 rounded-lg p-6 md:p-8 text-center bg-brand-primary/[0.03]">
              <p className="text-brand-text/70 text-sm mb-5">
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
              <p className="mt-4 text-[11px] text-brand-text/35">
                one email. no forms, no calendly maze.
              </p>
            </div>
          </Item>
        </Reveal>
      </div>
    </div>
  );
};

export default WorkPage;

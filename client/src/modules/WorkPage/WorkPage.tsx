import React, { useEffect, useState } from 'react';

const CONTACT_EMAIL = 'joeyefarah@gmail.com';

/** Proof — own work only. Never Elire client detail (NDA). */
const PROOF = [
  {
    name: 'joeyfarah.dev',
    line: 'This site. Terminal boot → bento grid → scroll-driven live ERD.',
    stack: 'React · TypeScript · Express · MongoDB · Railway',
    href: '/',
  },
  {
    name: 'Slippi Ranked Stats',
    line: 'Desktop analytics app for competitive Melee players.',
    stack: 'Desktop app · data pipeline · shipped',
    href: '/#slippi-ranked-stats',
  },
  {
    name: 'TrendArc',
    line: 'Fitness biometric dashboard — wearable data, made legible.',
    stack: 'Web app · charts · shipped',
    href: '/#trendarc',
  },
  {
    name: 'Oracle Cloud tooling',
    line: 'ERD explorer for the entire Oracle Cloud schema; conversion & SQL toolkits.',
    stack: 'Python · Dash · NetworkX · desktop',
    href: '/#oracle-db-diagram',
  },
] as const;

const STEPS = [
  { cmd: 'scope', line: 'We define the problem and the smallest finished thing that solves it.' },
  { cmd: 'build', line: 'I design and build it end to end — frontend, backend, data, deploy.' },
  { cmd: 'ship', line: 'You get a live, working product. Not a prototype. Not a handoff doc.' },
] as const;

/**
 * WorkPage — dedicated dev-for-hire services page at /work.
 *
 * Static curated copy by design: it changes rarely and shouldn't ride the
 * blocks API. Rendered instead of <App /> via the pathname branch in main.tsx.
 */
const WorkPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

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
    <div className="min-h-screen bg-brand-bg text-brand-text font-mono">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Back home */}
        <a
          href="/"
          aria-label="Back to joeyfarah.dev home"
          className="text-xs text-brand-text/50 hover:text-brand-primary transition-colors duration-150"
        >
          {'$ cd ~'}
        </a>

        {/* Spine */}
        <header className="mt-10 md:mt-14">
          <p className="text-brand-primary text-sm mb-4" aria-hidden="true">
            {'$ ./work --with joey'}
          </p>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">
            I take a real problem and ship the finished thing.
          </h1>
          <p className="mt-4 text-brand-text/70 text-sm md:text-base leading-relaxed">
            End to end, solo — design, frontend, backend, data, deploy. Most
            people can generate code. The rare part is finishing: a polished,
            live product someone actually uses.
          </p>
        </header>

        {/* What I build */}
        <section className="mt-12 md:mt-16" aria-labelledby="what-heading">
          <h2 id="what-heading" className="text-brand-primary text-sm mb-4">
            {'// what I build'}
          </h2>
          <ul className="space-y-2 text-sm md:text-base">
            <li>
              <span className="text-brand-primary select-none">{'> '}</span>
              Web apps and dashboards — idea to deployed MVP
            </li>
            <li>
              <span className="text-brand-primary select-none">{'> '}</span>
              Desktop tools — data-heavy apps people open every day
            </li>
            <li>
              <span className="text-brand-primary select-none">{'> '}</span>
              Data pipelines & internal tooling — the unglamorous stuff that has to work
            </li>
          </ul>
        </section>

        {/* Proof */}
        <section className="mt-12 md:mt-16" aria-labelledby="proof-heading">
          <h2 id="proof-heading" className="text-brand-primary text-sm mb-4">
            {'// proof — things I shipped, all mine'}
          </h2>
          <div className="space-y-5">
            {PROOF.map((p) => (
              <div key={p.name} className="border border-brand-primary/20 rounded p-4">
                <a
                  href={p.href}
                  className="text-brand-primary text-sm md:text-base underline underline-offset-2 decoration-brand-primary/40 hover:decoration-brand-primary transition-colors duration-150"
                >
                  {p.name}
                </a>
                <p className="mt-1 text-sm text-brand-text/80">{p.line}</p>
                <p className="mt-1 text-xs text-brand-text/40">{p.stack}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-brand-text/40 leading-relaxed">
            {'// day job: Oracle Cloud technical consultant, 7 years. '}
            {"that work stays at work — everything above is my own."}
          </p>
        </section>

        {/* How it works */}
        <section className="mt-12 md:mt-16" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-brand-primary text-sm mb-4">
            {'// how it works'}
          </h2>
          <ol className="space-y-3 text-sm md:text-base">
            {STEPS.map((s, i) => (
              <li key={s.cmd} className="flex gap-3">
                <span className="text-brand-primary select-none shrink-0">
                  {`${i + 1}. ${s.cmd}`}
                </span>
                <span className="text-brand-text/80">{s.line}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Single CTA */}
        <section className="mt-14 md:mt-20 mb-10 text-center" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="sr-only">
            Get in touch
          </h2>
          <p className="text-brand-text/70 text-sm mb-5">
            Have a problem that needs a finished thing?
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={handleEmailClick}
            data-testid="work-cta"
            aria-label={copied ? 'Email copied to clipboard' : `Email ${CONTACT_EMAIL}`}
            className="inline-block border border-brand-primary/40 rounded px-6 py-3 text-sm text-brand-primary hover:bg-brand-primary/10 transition-colors duration-150"
          >
            {copied ? '✓ copied to clipboard' : `$ mail ${CONTACT_EMAIL}`}
          </a>
        </section>
      </div>
    </div>
  );
};

export default WorkPage;

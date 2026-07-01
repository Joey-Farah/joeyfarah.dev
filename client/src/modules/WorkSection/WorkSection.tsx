import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Cloudflare Email Routing alias — forwards to the real inbox. Disposable by
// design: if it ever draws spam, rotate the alias and redeploy.
const CONTACT_EMAIL = 'hello@joeyfarah.dev';

// The old contact tile, absorbed — same `$ open <display>` rows it had.
const CONTACT_LINKS = [
  { platform: 'LinkedIn', display: 'linkedin.com/in/joey-farah', href: 'https://www.linkedin.com/in/joey-farah/' },
  { platform: 'GitHub', display: 'github.com/Joey-Farah', href: 'https://github.com/Joey-Farah' },
  { platform: 'Discord', display: 'discord: joeydonuts', href: 'https://discord.com/users/101538614428602368' },
] as const;

/**
 * WorkSection — the contact close. Sits last (after the bento grid) so the page
 * reads like a resume: intro → work → contact. Holds the email CTA and the
 * social links. /work, /hire, and /build all redirect to this section (#build).
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
      className="max-w-3xl mx-auto px-6 py-12 md:py-16"
      initial={reduce ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-brand-primary text-sm mb-4 font-mono" aria-hidden="true">
        {'$ ./contact'}
      </p>
      {/* Resume-style contact close — understated, not a pitch. */}
      <h2
        id="build-heading"
        className="font-mono text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        Get in <span className="text-brand-primary">touch</span>.
      </h2>

      {/* CTA */}
      <div className="mt-8 border border-brand-primary/30 rounded-lg p-6 md:p-8 text-center bg-brand-primary/[0.03] font-mono">
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

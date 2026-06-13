import React from 'react';

// Same Cloudflare Email Routing alias as WorkSection's primary CTA.
const CONTACT_EMAIL = 'hello@joeyfarah.dev';

/**
 * ClosingCTA — a light closing call-to-action at the very bottom of the page.
 *
 * The build section's CTA now sits high up (page order matches the nav), so a
 * visitor who reads all the proof reaches the end with nowhere to act. This
 * gives them one without repeating the whole offer.
 */
const ClosingCTA: React.FC = () => (
  <footer className="max-w-3xl mx-auto px-6 pb-20 md:pb-28 text-center font-mono">
    <p className="text-sm text-brand-text/85">
      <span className="text-brand-primary">{'// '}</span>
      still here? →{' '}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        data-testid="closing-cta"
        className="text-brand-primary underline underline-offset-2
                   decoration-brand-primary/40 hover:decoration-brand-primary
                   transition-colors duration-150"
      >
        {CONTACT_EMAIL}
      </a>
    </p>
  </footer>
);

export default ClosingCTA;

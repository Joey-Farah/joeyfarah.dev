import React from 'react';
import type { ContactLinksContent, ContactLink } from 'shared/types';

export interface ContactLinksRendererProps {
  content: ContactLinksContent;
  title: string;
}

/**
 * ContactLinksRenderer — terminal-styled contact link list.
 *
 * Each link is rendered as a terminal command line:
 *   $ open <display>
 *
 * Email links use mailto: href (open in mail client).
 * All other links open in a new tab (_blank) with rel="noopener noreferrer".
 *
 * brand-primary (#06b6d4) prompt glyph, brand-text for link text.
 * aria-label="<platform>" on each anchor for screen reader clarity.
 */
const ContactLinksRenderer: React.FC<ContactLinksRendererProps> = ({ content }) => {
  return (
    <div
      data-testid="contact-links-renderer"
      className="flex-1 p-4 font-mono text-sm overflow-auto"
      role="list"
      aria-label="Contact links"
    >
      {content.links.map((link: ContactLink) => {
        const isEmail = link.url.startsWith('mailto:');
        return (
          <div
            key={link.platform}
            className="flex items-center gap-2 py-2 md:py-1.5 group"
            role="listitem"
          >
            {/* Terminal prompt glyph */}
            <span
              className="select-none shrink-0"
              style={{ color: '#06b6d4' }}
              aria-hidden="true"
            >
              {'$'}
            </span>
            <span
              className="text-brand-text/50 select-none shrink-0"
              aria-hidden="true"
            >
              {'open'}
            </span>
            {/* Link */}
            <a
              href={link.url}
              aria-label={link.platform}
              className="text-brand-text hover:text-brand-primary transition-colors duration-150 underline-offset-2 hover:underline"
              {...(isEmail
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {link.display}
            </a>
          </div>
        );
      })}

      {content.links.length === 0 && (
        <span className="text-brand-text/40 text-xs">{'// no links configured'}</span>
      )}
    </div>
  );
};

export default ContactLinksRenderer;

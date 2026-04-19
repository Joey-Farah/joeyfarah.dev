import React, { useState } from 'react';
import type { ContactLinksContent, ContactLink } from 'shared/types';

export interface ContactLinksRendererProps {
  content: ContactLinksContent;
  title: string;
}

const ContactLinksRenderer: React.FC<ContactLinksRendererProps> = ({ content }) => {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>, link: ContactLink) => {
    const email = link.url.replace('mailto:', '');
    e.preventDefault();
    void navigator.clipboard.writeText(email).then(() => {
      setCopiedPlatform(link.platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    });
  };

  return (
    <div
      data-testid="contact-links-renderer"
      className="flex-1 p-4 font-mono text-sm overflow-auto flex flex-col justify-between"
      role="list"
      aria-label="Contact links"
    >
      <div>
        {content.links.map((link: ContactLink) => {
          const isEmail = link.url.startsWith('mailto:');
          const isCopied = copiedPlatform === link.platform;

          return (
            <div
              key={link.platform}
              className="flex items-center gap-2 py-2 md:py-1.5 group"
              role="listitem"
            >
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
              <a
                href={link.url}
                aria-label={isCopied ? `${link.platform} — copied!` : link.platform}
                className="text-brand-primary underline underline-offset-2 decoration-brand-primary/40 hover:decoration-brand-primary transition-colors duration-150"
                {...(isEmail
                  ? { onClick: (e) => handleEmailClick(e, link) }
                  : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {isCopied ? (
                  <span className="text-green-400">✓ copied!</span>
                ) : (
                  link.display
                )}
              </a>
            </div>
          );
        })}

        {/* Resume download */}
        <div className="flex items-center gap-2 py-2 md:py-1.5" role="listitem">
          <span className="select-none shrink-0" style={{ color: '#06b6d4' }} aria-hidden="true">
            {'$'}
          </span>
          <span className="text-brand-text/50 select-none shrink-0" aria-hidden="true">
            {'open'}
          </span>
          <a
            href="/api/resume"
            download="joey-farah-resume.txt"
            className="text-brand-primary underline underline-offset-2 decoration-brand-primary/40 hover:decoration-brand-primary transition-colors duration-150"
            aria-label="Download resume"
          >
            joey-farah-resume.txt
          </a>
        </div>
      </div>

{content.links.length === 0 && (
        <span className="text-brand-text/40 text-xs">{'// no links configured'}</span>
      )}
    </div>
  );
};

export default ContactLinksRenderer;

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type {
  BentoBlock,
  LayoutConfig,
  HeroContent,
  ContactLinksContent,
} from 'shared/types';
import BentoTile from '../BentoTile/BentoTile';

/**
 * ScrollFadeSection — wraps a <section> with scroll-linked opacity so it
 * fades in as it enters the viewport and fades out as it leaves.
 */
interface ScrollFadeSectionProps {
  id: string;
  ariaLabel: string;
  children: React.ReactNode;
}
const ScrollFadeSection: React.FC<ScrollFadeSectionProps> = ({ id, ariaLabel, children }) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  if (prefersReducedMotion) {
    return (
      <section id={id} aria-label={ariaLabel} className="scroll-mt-16">
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      className="scroll-mt-16"
      style={{ opacity }}
    >
      {children}
    </motion.section>
  );
};

export interface BentoGridProps {
  blocks: BentoBlock[];
}

/** LayoutConfig per slug — tuned for a 2-column sidebar-right grid. */
const LAYOUT_MAP: Record<string, LayoutConfig> = {
  'professional-timeline':  { colSpan: 2, rowSpan: 2 },
  'oracle-db-mapper':       { colSpan: 2, rowSpan: 2 },
  'conversion-automation':  { colSpan: 1, rowSpan: 1 },
  'fusion-sql-developer':   { colSpan: 1, rowSpan: 1 },
  'slippi-ranked-stats':    { colSpan: 1, rowSpan: 1 },
  'fitness-ring-analytics': { colSpan: 1, rowSpan: 1 },
  'habitat':                { colSpan: 1, rowSpan: 1 },
  'lombardi-project':       { colSpan: 1, rowSpan: 1 },
};

function getLayout(slug: string): LayoutConfig {
  return LAYOUT_MAP[slug] ?? { colSpan: 1, rowSpan: 1 };
}

/** Sidebar — persistent identity + contact rail on the left (desktop). */
const Sidebar: React.FC<{ blocks: BentoBlock[] }> = ({ blocks }) => {
  const hero = blocks.find((b) => b.type === 'hero');
  const contact = blocks.find((b) => b.type === 'contact-links');
  const heroContent = hero?.content as HeroContent | undefined;
  const contactContent = contact?.content as ContactLinksContent | undefined;

  return (
    <aside
      id="contact"
      aria-label="Identity and contact"
      className="font-mono space-y-10 lg:sticky lg:top-24 lg:self-start"
    >
      {heroContent && (
        <div>
          <h1 className="text-2xl md:text-3xl text-brand-primary mb-3 font-bold leading-tight">
            {heroContent.lines[0]}
          </h1>
          <div className="space-y-1 text-sm text-brand-text/80">
            {heroContent.lines.slice(1).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {contactContent && (
        <div>
          <h2 className="text-xs text-brand-primary mb-3 select-none">
            {'// connect'}
          </h2>
          <ul className="space-y-2 list-none p-0 m-0">
            {contactContent.links.map((link) => {
              const external = link.url.startsWith('http');
              return (
                <li key={link.platform}>
                  <a
                    href={link.url}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="text-xs text-brand-text/80 hover:text-brand-primary transition-colors inline-block"
                  >
                    {link.platform.toLowerCase()}
                    <span className="text-brand-text/40">{' → '}</span>
                    <span className="text-brand-text/60">{link.display}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};

/**
 * BentoGrid — sidebar-and-grid layout.
 *
 * Left rail: persistent identity + contact links (Sidebar).
 * Right side: scrolling bento grid of all project tiles.
 *
 * Mobile: stacks vertically (sidebar first, then grid).
 */
const BentoGrid: React.FC<BentoGridProps> = ({ blocks }) => {
  const renderable = blocks.filter((b) => b.visible);
  // Exclude hero + contact — they live in the sidebar
  const gridBlocks = renderable.filter(
    (b) => b.type !== 'hero' && b.type !== 'contact-links',
  );

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-24 pb-6 md:pb-12"
      data-testid="bento-grid"
    >
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 space-y-10 lg:space-y-0">
        <div className="lg:col-span-4">
          <Sidebar blocks={blocks} />
        </div>

        <div className="lg:col-span-8">
          <ScrollFadeSection id="projects" ariaLabel="Projects and work">
            <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense gap-4">
              {gridBlocks.map((block) => (
                <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
              ))}
            </div>
          </ScrollFadeSection>
        </div>
      </div>
    </div>
  );
};

export default BentoGrid;

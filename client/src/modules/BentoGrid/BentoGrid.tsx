import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { BentoBlock, LayoutConfig } from 'shared/types';
import BentoTile from '../BentoTile/BentoTile';

/**
 * ScrollFadeSection — wraps a <section> with scroll-linked opacity so it
 * fades in as it enters the viewport and fades out as it leaves. Mirrors
 * the hero's fade-out behavior for a continuous, momentum-friendly feel.
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

/**
 * LayoutConfig per slug — derived from ARCHITECTURE.md Bento Grid Layout Spec.
 *
 * professional-timeline: colSpan 2, rowSpan 3
 * oracle-db-mapper:      colSpan 1, rowSpan 2
 * all other project/contact tiles: colSpan 1, rowSpan 1 (default)
 * contact:               colSpan 3, rowSpan 1
 */
const LAYOUT_MAP: Record<string, LayoutConfig> = {
  'professional-timeline': { colSpan: 2, rowSpan: 3 },
  'oracle-db-mapper':      { colSpan: 1, rowSpan: 2 },
  'conversion-automation': { colSpan: 1, rowSpan: 1 },
  'fusion-sql-developer':  { colSpan: 1, rowSpan: 1 },
  'slippi-ranked-stats':   { colSpan: 1, rowSpan: 1 },
  'fitness-ring-analytics':{ colSpan: 1, rowSpan: 1 },
  'habitat':               { colSpan: 1, rowSpan: 1 },
  'lombardi-project':      { colSpan: 1, rowSpan: 1 },
  'contact':               { colSpan: 3, rowSpan: 1 },
};

/** Returns the LayoutConfig for a given slug, falling back to 1×1. */
function getLayout(slug: string): LayoutConfig {
  return LAYOUT_MAP[slug] ?? { colSpan: 1, rowSpan: 1 };
}

/**
 * BentoGrid — lays out BentoTile components in a responsive CSS grid.
 *
 * Breakpoints:
 *   - mobile  (default): 1 column
 *   - tablet  (md:768px): 2 columns
 *   - desktop (lg:1024px): 3 columns
 *
 * Section ids are hardcoded constants used by NavBar anchor links.
 */
const BentoGrid: React.FC<BentoGridProps> = ({ blocks }) => {
  const renderable = blocks.filter((b) => b.visible);

  const professionalBlocks = renderable.filter(
    (b) => b.type === 'timeline' || b.type === 'erd-tile',
  );

  const enterpriseBlocks = renderable.filter(
    (b) =>
      b.type === 'project-card' &&
      (b.slug === 'conversion-automation' || b.slug === 'fusion-sql-developer'),
  );

  const projectBlocks = renderable.filter(
    (b) =>
      b.type === 'project-card' &&
      b.slug !== 'conversion-automation' &&
      b.slug !== 'fusion-sql-developer',
  );

  const contactBlocks = renderable.filter((b) => b.type === 'contact-links');

  return (
    <div
      className="w-full max-w-6xl lg:max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-24 pb-6 md:pb-12 space-y-16"
      data-testid="bento-grid"
    >
      {/* Professional section */}
      <ScrollFadeSection id="professional" ariaLabel="Professional experience">
        <h2 className="font-mono text-brand-primary text-sm mb-3 md:mb-6 select-none">
          {'// professional'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionalBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </ScrollFadeSection>

      {/* Enterprise section */}
      <ScrollFadeSection id="enterprise" ariaLabel="Enterprise projects">
        <h2 className="font-mono text-brand-primary text-sm mb-3 md:mb-6 select-none">
          {'// enterprise'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enterpriseBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </ScrollFadeSection>

      {/* Projects section */}
      <ScrollFadeSection id="projects" ariaLabel="Personal projects">
        <h2 className="font-mono text-brand-primary text-sm mb-3 md:mb-6 select-none">
          {'// projects'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </ScrollFadeSection>

      {/* Contact section */}
      <ScrollFadeSection id="contact" ariaLabel="Contact information">
        <h2 className="font-mono text-brand-primary text-sm mb-3 md:mb-6 select-none">
          {'// contact'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </ScrollFadeSection>
    </div>
  );
};

export default BentoGrid;

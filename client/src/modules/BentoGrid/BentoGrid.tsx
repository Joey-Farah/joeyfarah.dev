import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import type { BentoBlock, LayoutConfig, DualTimelineContent } from 'shared/types';
import BentoTile from '../BentoTile/BentoTile';
import DualTimeline from './DualTimeline';
import SlippiStatsTile from './SlippiStatsTile';

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
  'professional-timeline': { colSpan: 3, rowSpan: 1 },
  'oracle-db-mapper':      { colSpan: 1, rowSpan: 1 },
  'conversion-automation': { colSpan: 1, rowSpan: 1 },
  'fusion-sql-developer':  { colSpan: 1, rowSpan: 1 },
  'slippi-ranked-stats':   { colSpan: 1, rowSpan: 1 },
  'fitness-ring-analytics':{ colSpan: 1, rowSpan: 1 },
  'joeyfarah-dev':         { colSpan: 1, rowSpan: 1 },
  'habitat':               { colSpan: 1, rowSpan: 1 },
  'lombardi-project':      { colSpan: 1, rowSpan: 1 },
  'reading-list':          { colSpan: 3, rowSpan: 1 },
  'music-list':            { colSpan: 3, rowSpan: 1 },
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

  const dualTimelineBlock = renderable.find((b) => b.type === 'dual-timeline');

  const professionalBlocks = renderable.filter((b) => b.type === 'timeline');

  const enterpriseBlocks = renderable.filter(() => false);

  const projectBlocks = renderable.filter((b) => b.type === 'project-card' || b.type === 'erd-tile');

  const personalBlocks = renderable.filter((b) => b.type === 'reading-list' || b.type === 'music-list');

  const contactBlocks = renderable.filter((b) => b.type === 'contact-links');

  return (
    <div
      className="w-full max-w-6xl lg:max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-24 pb-6 md:pb-12 space-y-4"
      data-testid="bento-grid"
    >
      {/* Dual timeline — full-width overview section */}
      {dualTimelineBlock && (
        <ScrollFadeSection id="professional-timeline" ariaLabel="Career timeline">
          <DualTimeline content={dualTimelineBlock.content as DualTimelineContent} />
        </ScrollFadeSection>
      )}

      {/* Enterprise section */}
      {enterpriseBlocks.length > 0 && (
        <ScrollFadeSection id="enterprise" ariaLabel="Enterprise projects">
          <p className="font-mono text-xs text-brand-text/40 px-1 mb-3">// enterprise</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
            {enterpriseBlocks.map((block) => (
              <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
            ))}
          </div>
        </ScrollFadeSection>
      )}

      {/* Projects section */}
      {projectBlocks.length > 0 && (
        <ScrollFadeSection id="projects" ariaLabel="Personal projects">
          <p className="font-mono text-xs text-brand-text/40 px-1 mb-3">// projects</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
            {projectBlocks.map((block) => (
              <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
            ))}
          </div>
        </ScrollFadeSection>
      )}

      {/* Resume section */}
      {professionalBlocks.length > 0 && (
        <ScrollFadeSection id="professional" ariaLabel="Professional experience">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
            {professionalBlocks.map((block) => (
              <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
            ))}
          </div>
        </ScrollFadeSection>
      )}

      {/* Personal section */}
      {personalBlocks.length > 0 && (
        <ScrollFadeSection id="personal" ariaLabel="Personal interests">
          <p className="font-mono text-xs text-brand-text/40 px-1 mb-3">// personal</p>
          <div className="flex flex-col gap-4">
            <SlippiStatsTile />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
              {personalBlocks.map((block) => (
                <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
              ))}
            </div>
          </div>
        </ScrollFadeSection>
      )}

      {/* Contact section */}
      {contactBlocks.length > 0 && (
        <ScrollFadeSection id="contact" ariaLabel="Contact information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4">
            {contactBlocks.map((block) => (
              <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
            ))}
          </div>
        </ScrollFadeSection>
      )}
    </div>
  );
};

export default BentoGrid;

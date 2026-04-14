import React from 'react';
import type { BentoBlock, LayoutConfig } from 'shared/types';
import BentoTile from '../BentoTile/BentoTile';

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
  const professionalBlocks = blocks.filter(
    (b) => b.type === 'timeline' || b.type === 'erd-tile',
  );

  const enterpriseBlocks = blocks.filter(
    (b) =>
      b.type === 'project-card' &&
      (b.slug === 'conversion-automation' || b.slug === 'fusion-sql-developer'),
  );

  const projectBlocks = blocks.filter(
    (b) =>
      b.type === 'project-card' &&
      b.slug !== 'conversion-automation' &&
      b.slug !== 'fusion-sql-developer',
  );

  const contactBlocks = blocks.filter((b) => b.type === 'contact-links');

  return (
    <div
      className="w-full max-w-6xl mx-auto px-6 pt-24 pb-12 space-y-16"
      data-testid="bento-grid"
    >
      {/* Professional section */}
      <section id="professional" aria-label="Professional experience" className="scroll-mt-16">
        <h2 className="font-mono text-brand-primary text-sm mb-6 select-none">
          {'// professional'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionalBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </section>

      {/* Enterprise section */}
      <section id="enterprise" aria-label="Enterprise projects" className="scroll-mt-16">
        <h2 className="font-mono text-brand-primary text-sm mb-6 select-none">
          {'// enterprise'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enterpriseBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </section>

      {/* Projects section */}
      <section id="projects" aria-label="Personal projects" className="scroll-mt-16">
        <h2 className="font-mono text-brand-primary text-sm mb-6 select-none">
          {'// projects'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </section>

      {/* Contact section */}
      <section id="contact" aria-label="Contact information" className="scroll-mt-16">
        <h2 className="font-mono text-brand-primary text-sm mb-6 select-none">
          {'// contact'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactBlocks.map((block) => (
            <BentoTile key={block.slug} layout={getLayout(block.slug)} block={block} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default BentoGrid;

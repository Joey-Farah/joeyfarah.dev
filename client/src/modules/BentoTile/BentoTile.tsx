import React from 'react';
import type { BentoBlock, LayoutConfig } from 'shared/types';
import TimelineRenderer from './renderers/TimelineRenderer';
import ERDTileRenderer from './renderers/ERDTileRenderer';
import ProjectCardRenderer from './renderers/ProjectCardRenderer';
import ContactLinksRenderer from './renderers/ContactLinksRenderer';
import type {
  TimelineContent,
  ErdTileContent,
  ProjectCardContent,
  ContactLinksContent,
} from 'shared/types';

export interface BentoTileProps {
  layout: LayoutConfig;
  block: BentoBlock;
}

/**
 * BentoTile — Deep module.
 *
 * Renders terminal chrome (title bar with 3 colored circles, prompt glyph ">_",
 * blinking cursor) and dispatches to the appropriate sub-renderer based on block.type.
 *
 * Applies grid span via inline style so it works with any parent CSS grid.
 * Single-column on mobile (grid-column/row span are effectively ignored at 1-col layout),
 * proper spans kick in at md/lg breakpoints set by BentoGrid.
 */
const BentoTile: React.FC<BentoTileProps> = ({ layout, block }) => {
  const colSpan = layout.colSpan ?? 1;
  const rowSpan = layout.rowSpan ?? 1;

  const gridStyle: React.CSSProperties = {
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
  };

  const renderContent = () => {
    switch (block.type) {
      case 'timeline':
        return (
          <TimelineRenderer
            content={block.content as TimelineContent}
            title={block.title}
          />
        );
      case 'erd-tile':
        return (
          <ERDTileRenderer
            content={block.content as ErdTileContent}
            title={block.title}
          />
        );
      case 'project-card':
        return (
          <ProjectCardRenderer
            content={block.content as ProjectCardContent}
            title={block.title}
            slug={block.slug}
          />
        );
      case 'contact-links':
        return (
          <ContactLinksRenderer
            content={block.content as ContactLinksContent}
            title={block.title}
          />
        );
      default:
        return (
          <div className="flex-1 p-4 font-mono text-brand-text/40 text-sm">
            {'// unknown block type'}
          </div>
        );
    }
  };

  return (
    <div
      data-testid="bento-tile"
      data-slug={block.slug}
      style={gridStyle}
      aria-label={block.title}
      role="region"
      className="flex flex-col bg-brand-bg border border-brand-primary/20 rounded overflow-hidden min-h-[120px]"
    >
      {/* Terminal chrome: title bar */}
      <div
        data-testid="title-bar"
        className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-brand-primary/10 shrink-0"
      >
        {/* Window control circles */}
        <span
          data-testid="window-control-red"
          aria-hidden="true"
          className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
          style={{ backgroundColor: '#ef4444' }}
        />
        <span
          data-testid="window-control-yellow"
          aria-hidden="true"
          className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
          style={{ backgroundColor: '#eab308' }}
        />
        <span
          data-testid="window-control-green"
          aria-hidden="true"
          className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
          style={{ backgroundColor: '#22c55e' }}
        />

        {/* Title text */}
        <span className="ml-2 font-mono text-brand-text text-xs truncate select-none flex-1">
          {block.title}
        </span>

        {/* Prompt glyph and blinking cursor */}
        <span
          data-testid="prompt-glyph"
          className="font-mono text-xs select-none shrink-0"
          style={{ color: '#06b6d4' }}
        >
          {'>_'}
        </span>
        <span
          data-testid="prompt-cursor"
          aria-hidden="true"
          className="inline-block w-1 md:w-1.5 h-3 md:h-3.5 bg-brand-primary animate-pulse shrink-0"
        />
      </div>

      {/* Sub-renderer content area */}
      <div className="flex flex-col flex-1 min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default BentoTile;

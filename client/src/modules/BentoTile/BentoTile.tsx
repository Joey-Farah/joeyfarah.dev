import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import type {
  BentoBlock,
  LayoutConfig,
  TimelineContent,
  ErdTileContent,
  ProjectCardContent,
  ContactLinksContent,
  ReadingListContent,
  MusicListContent,
} from 'shared/types';
import TimelineRenderer from './renderers/TimelineRenderer';
import ProjectCardRenderer from './renderers/ProjectCardRenderer';
import ContactLinksRenderer from './renderers/ContactLinksRenderer';
import ReadingListRenderer from './renderers/ReadingListRenderer';
import MusicListRenderer from './renderers/MusicListRenderer';

const ERDTileRenderer = lazy(() => import('./renderers/ERDTileRenderer'));

const ERDFallback: React.FC = () => (
  <div className="flex-1 p-4 font-mono text-brand-text/40 text-sm">
    {'// loading erd...'}
  </div>
);

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
  const [copied, setCopied] = useState(false);

  const gridStyle: React.CSSProperties = {
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/#${block.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
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
          <Suspense fallback={<ERDFallback />}>
            <ERDTileRenderer
              content={block.content as ErdTileContent}
              title={block.title}
            />
          </Suspense>
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
      case 'reading-list':
        return (
          <ReadingListRenderer
            content={block.content as ReadingListContent}
          />
        );
      case 'music-list':
        return (
          <MusicListRenderer
            content={block.content as MusicListContent}
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
    <motion.div
      data-testid="bento-tile"
      data-slug={block.slug}
      id={block.slug}
      style={gridStyle}
      aria-label={block.title}
      role="region"
      className="flex flex-col bg-brand-bg border border-brand-primary/20 rounded overflow-hidden min-h-[120px] scroll-mt-16"
      whileHover={{ borderColor: 'rgba(6,182,212,0.5)', boxShadow: '0 0 16px rgba(6,182,212,0.08)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Terminal chrome: title bar — click to copy deep link */}
      <button
        type="button"
        onClick={handleCopyLink}
        data-testid="title-bar"
        aria-label={copied ? `Link to ${block.title} copied` : `Copy link to ${block.title}`}
        className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-brand-primary/10 shrink-0 text-left cursor-pointer hover:bg-black/60 transition-colors w-full"
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
          {copied ? `✓ copied #${block.slug}` : block.title}
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
      </button>

      {/* Sub-renderer content area */}
      <div className="flex flex-col flex-1 min-h-0">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default BentoTile;

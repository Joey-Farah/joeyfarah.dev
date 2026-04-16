import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BentoTile from './BentoTile';
import type { BentoBlock, LayoutConfig } from 'shared/types';

// ─── Fixture helpers ────────────────────────────────────────────────────────

const baseBlock = (overrides: Partial<BentoBlock>): BentoBlock => ({
  slug: 'test-block',
  title: 'Test Block',
  order: 0,
  visible: true,
  type: 'timeline',
  content: { entries: [] },
  ...overrides,
});

const defaultLayout: LayoutConfig = { colSpan: 1, rowSpan: 1 };

// ─── Terminal chrome tests ──────────────────────────────────────────────────

describe('BentoTile — terminal chrome', () => {
  it('renders the title bar element', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('title-bar')).toBeInTheDocument();
  });

  it('renders 3 window control circles (red, yellow, green)', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('window-control-red')).toBeInTheDocument();
    expect(screen.getByTestId('window-control-yellow')).toBeInTheDocument();
    expect(screen.getByTestId('window-control-green')).toBeInTheDocument();
  });

  it('window control circles have correct brand colors', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('window-control-red')).toHaveStyle({ backgroundColor: '#ef4444' });
    expect(screen.getByTestId('window-control-yellow')).toHaveStyle({ backgroundColor: '#eab308' });
    expect(screen.getByTestId('window-control-green')).toHaveStyle({ backgroundColor: '#22c55e' });
  });

  it('renders the prompt glyph ">_" in brand-primary color', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={defaultLayout} block={block} />);
    const glyph = screen.getByTestId('prompt-glyph');
    expect(glyph).toBeInTheDocument();
    expect(glyph).toHaveTextContent('>_');
    expect(glyph).toHaveStyle({ color: '#06b6d4' });
  });

  it('renders a blinking cursor after the prompt', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('prompt-cursor')).toBeInTheDocument();
  });

  it('renders the block title in the title bar', () => {
    const block = baseBlock({ title: 'Professional Timeline', type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={defaultLayout} block={block} />);
    // Title appears in the title bar chrome span (and also in the renderer placeholder).
    // Use getAllByText and assert at least one match exists.
    const matches = screen.getAllByText('Professional Timeline');
    expect(matches.length).toBeGreaterThan(0);
    // Verify the title bar specifically contains the title
    const titleBar = screen.getByTestId('title-bar');
    expect(titleBar).toHaveTextContent('Professional Timeline');
  });
});

// ─── Sub-renderer dispatch tests ────────────────────────────────────────────

describe('BentoTile — sub-renderer dispatch', () => {
  it('dispatches to TimelineRenderer for type "timeline"', () => {
    const block = baseBlock({
      type: 'timeline',
      content: { entries: [] },
    });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('timeline-renderer')).toBeInTheDocument();
  });

  it('dispatches to ERDTileRenderer for type "erd-tile"', async () => {
    const block = baseBlock({
      type: 'erd-tile',
      content: { description: 'test', nodes: [], edges: [] },
    });
    render(<BentoTile layout={defaultLayout} block={block} />);
    // ERDTileRenderer is lazy-loaded — wait for Suspense to resolve
    await waitFor(() => {
      expect(screen.getByTestId('erd-tile-renderer')).toBeInTheDocument();
    });
  });

  it('dispatches to ProjectCardRenderer for type "project-card"', () => {
    const block = baseBlock({
      type: 'project-card',
      content: { description: 'test', stack: [], links: [], status: 'live' },
    });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('project-card-renderer')).toBeInTheDocument();
  });

  it('dispatches to ContactLinksRenderer for type "contact-links"', () => {
    const block = baseBlock({
      type: 'contact-links',
      content: { links: [] },
    });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.getByTestId('contact-links-renderer')).toBeInTheDocument();
  });

  it('does NOT render wrong renderer for a given type', () => {
    const block = baseBlock({
      type: 'project-card',
      content: { description: 'test', stack: [], links: [], status: 'live' },
    });
    render(<BentoTile layout={defaultLayout} block={block} />);
    expect(screen.queryByTestId('timeline-renderer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('erd-tile-renderer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-links-renderer')).not.toBeInTheDocument();
  });
});

// ─── Layout / grid span tests ────────────────────────────────────────────────

describe('BentoTile — grid span via inline style', () => {
  it('applies gridColumn span from layout.colSpan', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={{ colSpan: 2, rowSpan: 3 }} block={block} />);
    const tile = screen.getByTestId('bento-tile');
    expect(tile).toHaveStyle({ gridColumn: 'span 2', gridRow: 'span 3' });
  });

  it('defaults to span 1 when layout omits colSpan/rowSpan', () => {
    const block = baseBlock({ type: 'timeline', content: { entries: [] } });
    render(<BentoTile layout={{}} block={block} />);
    const tile = screen.getByTestId('bento-tile');
    expect(tile).toHaveStyle({ gridColumn: 'span 1', gridRow: 'span 1' });
  });
});

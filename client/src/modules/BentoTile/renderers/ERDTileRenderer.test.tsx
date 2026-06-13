import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ERDTileRenderer from './ERDTileRenderer';
import type { ErdTileContent } from 'shared/types';

// A → B are connected; C is unrelated. So focusing A should keep A (selected)
// and B (active) lit, and dim C.
const content: ErdTileContent = {
  description: 'test schema',
  status: 'live',
  nodes: [
    { id: 'A', label: 'A', x: 0, y: 0 },
    { id: 'B', label: 'B', x: 300, y: 0 },
    { id: 'C', label: 'C', x: 0, y: 300 },
  ],
  edges: [{ from: 'A', to: 'B', label: 'has' }],
};

describe('ERDTileRenderer — click to explore', () => {
  it('focuses a node and its one-hop neighbors, dimming the rest', () => {
    render(<ERDTileRenderer content={content} title="ERD" />);
    fireEvent.click(screen.getByTestId('erd-node-A'));
    expect(screen.getByTestId('erd-node-A')).toHaveAttribute('data-focus', 'selected');
    expect(screen.getByTestId('erd-node-B')).toHaveAttribute('data-focus', 'active');
    expect(screen.getByTestId('erd-node-C')).toHaveAttribute('data-focus', 'dimmed');
  });

  it('lights the connected edge and dims unrelated edges', () => {
    const twoEdges: ErdTileContent = {
      ...content,
      edges: [
        { from: 'A', to: 'B', label: 'has' },
        { from: 'B', to: 'C', label: 'owns' },
      ],
    };
    render(<ERDTileRenderer content={twoEdges} title="ERD" />);
    fireEvent.click(screen.getByTestId('erd-node-A'));
    expect(screen.getByTestId('erd-edge-0')).toHaveAttribute('data-focus', 'active');
    expect(screen.getByTestId('erd-edge-1')).toHaveAttribute('data-focus', 'dimmed');
  });

  it('resets to default when the selected node is clicked again', () => {
    render(<ERDTileRenderer content={content} title="ERD" />);
    const a = screen.getByTestId('erd-node-A');
    fireEvent.click(a);
    fireEvent.click(a);
    expect(screen.getByTestId('erd-node-C')).toHaveAttribute('data-focus', 'default');
  });

  it('resets to default when the background surface is clicked', () => {
    render(<ERDTileRenderer content={content} title="ERD" />);
    fireEvent.click(screen.getByTestId('erd-node-A'));
    fireEvent.click(screen.getByTestId('erd-surface'));
    expect(screen.getByTestId('erd-node-C')).toHaveAttribute('data-focus', 'default');
  });

  it('is keyboard-operable: Enter selects, and exposes aria-pressed', () => {
    render(<ERDTileRenderer content={content} title="ERD" />);
    const a = screen.getByTestId('erd-node-A');
    expect(a).toHaveAttribute('aria-pressed', 'false');
    a.focus();
    fireEvent.keyDown(a, { key: 'Enter' });
    expect(a).toHaveAttribute('data-focus', 'selected');
    expect(a).toHaveAttribute('aria-pressed', 'true');
  });
});

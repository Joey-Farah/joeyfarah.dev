import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkPage from './WorkPage';

describe('WorkPage', () => {
  it('leads with the spine headline', () => {
    render(<WorkPage />);
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent(/real problem.*ship the finished thing/i);
  });

  it('shows own-work proof only — never Elire client detail', () => {
    render(<WorkPage />);
    // Own work is cited as evidence
    expect(screen.getAllByText(/slippi ranked stats/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/joeyfarah\.dev/i).length).toBeGreaterThan(0);
    // Day job may be named as background, but no client work language
    expect(screen.queryByText(/client engagement/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/case study/i)).not.toBeInTheDocument();
  });

  it('has exactly one primary CTA (email)', () => {
    render(<WorkPage />);
    const ctas = screen.getAllByTestId('work-cta');
    expect(ctas).toHaveLength(1);
    expect(ctas[0]).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });

  it('proof links to real, verifiable artifacts (source, releases, live apps)', () => {
    render(<WorkPage />);
    const external = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('https://'));
    // At minimum: site source, Slippi repo + download, TrendArc live app
    expect(external.length).toBeGreaterThanOrEqual(4);
    // Every external link opens safely in a new tab
    external.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
    expect(
      external.some((a) => a.getAttribute('href')?.includes('github.com/Joey-Farah/joeyfarah.dev')),
    ).toBe(true);
  });

  it('links back to the home page', () => {
    render(<WorkPage />);
    const home = screen.getByRole('link', { name: /back to joeyfarah\.dev home/i });
    expect(home).toHaveAttribute('href', '/');
  });
});

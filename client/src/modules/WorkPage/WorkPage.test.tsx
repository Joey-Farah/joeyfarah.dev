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
    expect(screen.getByText(/slippi ranked stats/i)).toBeInTheDocument();
    expect(screen.getByText(/joeyfarah\.dev/i)).toBeInTheDocument();
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

  it('links back to the home page', () => {
    render(<WorkPage />);
    const home = screen.getByRole('link', { name: /back to joeyfarah\.dev home/i });
    expect(home).toHaveAttribute('href', '/');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkSection from './WorkSection';

describe('WorkSection', () => {
  it('renders the craft-statement heading', () => {
    render(<WorkSection />);
    expect(
      screen.getByRole('heading', { level: 2 }),
    ).toHaveTextContent(/design, build, and ship software — all of it\./i);
  });

  it('has exactly one primary CTA (email)', () => {
    render(<WorkSection />);
    const ctas = screen.getAllByTestId('work-cta');
    expect(ctas).toHaveLength(1);
    expect(ctas[0]).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });

  it('external contact links open safely in new tabs', () => {
    render(<WorkSection />);
    const external = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('https://'));
    expect(external.length).toBeGreaterThanOrEqual(4);
    external.forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });

  it('never leaks Elire client language', () => {
    render(<WorkSection />);
    expect(screen.queryByText(/elire/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/client engagement/i)).not.toBeInTheDocument();
  });
});

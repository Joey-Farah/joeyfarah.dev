import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IntroSection from './IntroSection';

describe('IntroSection', () => {
  it('leads with the craft-statement heading (the page opener)', () => {
    render(<IntroSection />);
    expect(
      screen.getByRole('heading', { level: 2 }),
    ).toHaveTextContent(/design, build, and ship software\./i);
  });

  it('shows the how-I-work process steps', () => {
    render(<IntroSection />);
    expect(screen.getByText(/smallest finished thing/i)).toBeInTheDocument();
    expect(screen.getByText(/a live product\. not a prototype\./i)).toBeInTheDocument();
  });

  it('never leaks Elire client language', () => {
    render(<IntroSection />);
    expect(screen.queryByText(/elire/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/client engagement/i)).not.toBeInTheDocument();
  });
});

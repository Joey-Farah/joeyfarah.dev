import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IntroSection from './IntroSection';

describe('IntroSection', () => {
  it('leads with the multi-dimensional "who I am" heading', () => {
    render(<IntroSection />);
    expect(
      screen.getByRole('heading', { level: 2 }),
    ).toHaveTextContent(/one person, a few obsessions\./i);
  });

  it('introduces the range across lanes (consulting, building, competing)', () => {
    render(<IntroSection />);
    expect(screen.getByText(/oracle cloud consultant/i)).toBeInTheDocument();
    expect(screen.getByText(/build my own things/i)).toBeInTheDocument();
    expect(screen.getByText(/super smash bros\. melee/i)).toBeInTheDocument();
  });

  it('never leaks Elire client language', () => {
    render(<IntroSection />);
    expect(screen.queryByText(/elire/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/client engagement/i)).not.toBeInTheDocument();
  });
});

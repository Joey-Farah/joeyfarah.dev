import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IntroSection from './IntroSection';

describe('IntroSection', () => {
  it('leads with the "Hi, I\'m Joey" heading', () => {
    render(<IntroSection />);
    expect(
      screen.getByRole('heading', { level: 2 }),
    ).toHaveTextContent(/hi, i'm joey/i);
  });

  it('introduces the range across lanes (consulting, building, competing)', () => {
    const { container } = render(<IntroSection />);
    expect(container.textContent).toMatch(/oracle cloud/i);
    expect(container.textContent).toMatch(/database engine/i);
    expect(container.textContent).toMatch(/super smash bros\. melee/i);
  });

  it('never leaks Elire client language', () => {
    render(<IntroSection />);
    expect(screen.queryByText(/elire/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/client engagement/i)).not.toBeInTheDocument();
  });
});

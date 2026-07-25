import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

describe('NavBar — work page link', () => {
  it('links to the contact section once the hero has exited', () => {
    render(<NavBar showHero={false} />);
    const contactLink = screen.getByTestId('nav-link-contact');
    expect(contactLink).toHaveAttribute('href', '#build');
  });

  it('points the projects link at the top of the projects section, not a single card', () => {
    render(<NavBar showHero={false} />);
    const projectsLink = screen.getByTestId('nav-link-projects');
    expect(projectsLink).toHaveAttribute('href', '#projects');
  });

  it('renders nothing while the hero is showing', () => {
    render(<NavBar showHero={true} />);
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
  });

  it('centers the link list safely so overflow never crops the first link off-screen', () => {
    // mx-auto (or plain justify-center) on overflowing content computes even
    // overflow on both sides, but scrollLeft can never go negative — so the
    // first link becomes permanently unreachable on narrow phones. `safe
    // center` centers when content fits and falls back to start-alignment
    // (scrollLeft 0) when it overflows.
    render(<NavBar showHero={false} />);
    const list = screen.getByTestId('nav-link-contact').closest('ul');
    expect(list?.className).not.toMatch(/\bmx-auto\b/);
    expect(list?.parentElement?.className).not.toMatch(/justify-center\b/);
    // Inline style, not a Tailwind class: Tailwind can't generate arbitrary
    // values for the `justify-` prefix (ambiguous with justify-items/-self).
    expect(list?.parentElement).toHaveStyle({ justifyContent: 'safe center' });
  });
});

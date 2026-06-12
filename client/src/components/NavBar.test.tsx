import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

describe('NavBar — work page link', () => {
  it('links to the build section once the hero has exited', () => {
    render(<NavBar showHero={false} />);
    const buildLink = screen.getByTestId('nav-link-build');
    expect(buildLink).toHaveAttribute('href', '#build');
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
});

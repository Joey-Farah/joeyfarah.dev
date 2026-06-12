import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

describe('NavBar — work page link', () => {
  it('links to the hire section once the hero has exited', () => {
    render(<NavBar showHero={false} />);
    const workLink = screen.getByRole('link', { name: /work with me/i });
    expect(workLink).toHaveAttribute('href', '#hire');
  });

  it('renders nothing while the hero is showing', () => {
    render(<NavBar showHero={true} />);
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
  });
});

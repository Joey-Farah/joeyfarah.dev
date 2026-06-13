import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClosingCTA from './ClosingCTA';

describe('ClosingCTA', () => {
  it('renders a closing mailto link to the contact alias', () => {
    render(<ClosingCTA />);
    const link = screen.getByTestId('closing-cta');
    expect(link).toHaveAttribute('href', 'mailto:hello@joeyfarah.dev');
  });
});

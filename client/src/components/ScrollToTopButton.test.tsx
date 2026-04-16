import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ScrollToTopButton from './ScrollToTopButton';

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
}

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    setScrollY(0);
  });

  it('is hidden on initial render near the top of the page', () => {
    render(<ScrollToTopButton />);
    expect(screen.queryByTestId('scroll-to-top')).not.toBeInTheDocument();
  });

  it('appears once scrollY exceeds the threshold', () => {
    render(<ScrollToTopButton />);
    act(() => setScrollY(700));
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
  });

  it('scrolls to top when clicked', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;

    render(<ScrollToTopButton />);
    act(() => setScrollY(700));

    fireEvent.click(screen.getByTestId('scroll-to-top'));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});

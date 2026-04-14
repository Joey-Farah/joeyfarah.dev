import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import type { BentoBlock, HeroContent } from 'shared/types';

// ─── window.matchMedia mock (required for jsdom) ──────────────────────────────
// Must be defined before Hero is imported so Framer Motion picks it up.

function mockMatchMedia(prefersReducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersReducedMotion
        ? query === '(prefers-reduced-motion: reduce)'
        : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock framer-motion's useReducedMotion to be controllable in tests
const mockUseReducedMotion = vi.fn(() => false);

vi.mock('framer-motion', async (importOriginal) => {
  const original = await importOriginal<typeof import('framer-motion')>();
  return {
    ...original,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

// Import Hero after mocking framer-motion
const { default: Hero } = await import('./Hero');

// ─── Fixture data ──────────────────────────────────────────────────────────────

const heroContent: HeroContent = {
  lines: [
    'Joey Farah',
    'Oracle Cloud ERP Consultant — 4 years',
    'Super Smash Bros. Melee — Diamond ranked',
    'Building tools for enterprise and fun.',
  ],
};

const heroBlock: BentoBlock & { content: HeroContent } = {
  slug: 'hero',
  type: 'hero',
  title: 'Hero',
  order: 0,
  visible: true,
  content: heroContent,
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('Hero', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('prefers-reduced-motion: active', () => {
    beforeEach(() => {
      mockMatchMedia(true);
      mockUseReducedMotion.mockReturnValue(true);
    });

    it('renders StaticProfileCard instead of the animated component', () => {
      render(<Hero data={heroBlock} />);
      expect(screen.getByTestId('static-profile-card')).toBeInTheDocument();
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
    });

    it('all lines are immediately visible in StaticProfileCard', () => {
      render(<Hero data={heroBlock} />);
      heroContent.lines.forEach((line) => {
        expect(screen.getByText(line)).toBeInTheDocument();
      });
    });
  });

  describe('prefers-reduced-motion: inactive', () => {
    beforeEach(() => {
      mockMatchMedia(false);
      mockUseReducedMotion.mockReturnValue(false);
    });

    it('renders the animated Hero container, not StaticProfileCard', () => {
      render(<Hero data={heroBlock} />);
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.queryByTestId('static-profile-card')).not.toBeInTheDocument();
    });

    it('boot lines from data.content.lines appear in the DOM after animation interval', async () => {
      vi.useFakeTimers();
      render(<Hero data={heroBlock} />);

      // Advance timers enough for all lines to render (80ms * lines.length + buffer)
      await act(async () => {
        vi.advanceTimersByTime(80 * heroContent.lines.length + 200);
      });

      heroContent.lines.forEach((line) => {
        expect(screen.getByText(line)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('shows cursor before all lines are rendered', async () => {
      vi.useFakeTimers();
      render(<Hero data={heroBlock} />);

      // At start, first interval has not fired yet, cursor should be visible
      expect(screen.getByTestId('cursor')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('first line appears after first interval tick', async () => {
      vi.useFakeTimers();
      render(<Hero data={heroBlock} />);

      await act(async () => {
        vi.advanceTimersByTime(80 + 10);
      });

      expect(screen.getByTestId('boot-line-0')).toBeInTheDocument();
      expect(screen.getByTestId('boot-line-0').textContent).toBe(heroContent.lines[0]);

      vi.useRealTimers();
    });
  });
});

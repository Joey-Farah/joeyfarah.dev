import { describe, it, expect } from 'vitest';
import { shouldHideHero } from './heroScroll';

describe('shouldHideHero', () => {
  it('stays false for a mobile address-bar-collapse phantom scroll on load', () => {
    // iPhone-sized viewport; toolbar collapse commonly shifts scrollY ~50-100px
    // with zero user interaction.
    expect(shouldHideHero(90, 800)).toBe(false);
  });

  it('flips true once the user has genuinely scrolled past the hero', () => {
    expect(shouldHideHero(220, 800)).toBe(true);
  });

  it('still triggers quickly on short viewports', () => {
    expect(shouldHideHero(160, 400)).toBe(true);
    expect(shouldHideHero(90, 400)).toBe(false);
  });
});

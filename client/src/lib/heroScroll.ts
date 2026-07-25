/**
 * Decides whether the hero should hide (and NavBar reveal) for a given scroll
 * position. A flat pixel threshold is unreliable on mobile: address-bar
 * collapse on load fires scroll events that shift window.scrollY by roughly
 * the toolbar's height (~50-100px) with no user input at all. The threshold
 * scales with viewport height so that phantom scroll can't cross it, while a
 * real swipe still crosses it quickly.
 */
export function heroHideThreshold(viewportHeight: number): number {
  return Math.max(150, viewportHeight * 0.2);
}

export function shouldHideHero(scrollY: number, viewportHeight: number): boolean {
  return scrollY > heroHideThreshold(viewportHeight);
}

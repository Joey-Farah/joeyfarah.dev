import '@testing-library/jest-dom';

// ─── matchMedia mock ─────────────────────────────────────────────────────────
// jsdom does not implement matchMedia. Several components call it to honor
// prefers-reduced-motion. Provide a minimal stub that always reports "false".

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── IntersectionObserver mock ───────────────────────────────────────────────
// jsdom does not implement IntersectionObserver. Framer Motion's useInView hook
// calls it on mount. Provide a minimal stub so tests don't crash.

const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn().mockImplementation((el) => {
    // Immediately call callback with isIntersecting: false so the component
    // renders without triggering animations in tests.
    callback([{ isIntersecting: false, target: el }]);
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

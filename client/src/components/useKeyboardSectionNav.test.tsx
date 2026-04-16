import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useKeyboardSectionNav } from './useKeyboardSectionNav';

const Harness: React.FC = () => {
  useKeyboardSectionNav();
  return <input data-testid="input" />;
};

function addSection(id: string, top: number) {
  const section = document.createElement('section');
  section.id = id;
  section.getBoundingClientRect = () =>
    ({ top, bottom: top + 500, left: 0, right: 0, width: 0, height: 500, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  document.body.appendChild(section);
}

function dispatch(key: string, target: EventTarget = window) {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(ev);
  return ev;
}

describe('useKeyboardSectionNav', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('scrolls to the next section on ArrowDown', () => {
    addSection('professional', 100);
    addSection('enterprise', 800);
    addSection('projects', 1600);
    addSection('contact', 2400);
    render(<Harness />);

    dispatch('ArrowDown');
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: expect.any(Number) }),
    );
  });

  it('does nothing when typing in an input', () => {
    addSection('professional', 100);
    addSection('enterprise', 800);
    const { getByTestId } = render(<Harness />);

    dispatch('ArrowDown', getByTestId('input'));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('does nothing when a modifier key is held', () => {
    addSection('professional', 100);
    addSection('enterprise', 800);
    render(<Harness />);

    const ev = new KeyboardEvent('keydown', { key: 'ArrowDown', metaKey: true, bubbles: true, cancelable: true });
    window.dispatchEvent(ev);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('ignores unrelated keys', () => {
    addSection('professional', 100);
    render(<Harness />);

    dispatch('a');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('supports j/k vim-style bindings', () => {
    addSection('professional', 100);
    addSection('enterprise', 800);
    render(<Harness />);

    dispatch('j');
    expect(window.scrollTo).toHaveBeenCalled();
  });
});

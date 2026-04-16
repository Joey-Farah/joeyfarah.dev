import { useEffect } from 'react';

const SECTION_IDS = ['professional', 'enterprise', 'projects', 'contact'] as const;

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

type SectionTop = { id: string; top: number };

function getSectionTops(): SectionTop[] {
  const out: SectionTop[] = [];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    out.push({ id, top: el.getBoundingClientRect().top + window.scrollY });
  }
  return out;
}

export function useKeyboardSectionNav(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key;
      const isNext = key === 'ArrowDown' || key === 'j' || key === 'J';
      const isPrev = key === 'ArrowUp' || key === 'k' || key === 'K';
      if (!isNext && !isPrev) return;

      const sections = getSectionTops();
      if (sections.length === 0) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
      const current = window.scrollY;
      const EPSILON = 8;

      if (isNext) {
        const next = sections.find((s) => s.top > current + EPSILON);
        if (!next) return;
        e.preventDefault();
        window.scrollTo({ top: next.top - 64, behavior });
      } else {
        const reversed = [...sections].reverse();
        const prev = reversed.find((s) => s.top < current - EPSILON);
        if (!prev) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior });
          return;
        }
        e.preventDefault();
        window.scrollTo({ top: prev.top - 64, behavior });
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
}

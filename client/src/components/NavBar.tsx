import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveSection } from './useActiveSection';

export interface NavBarProps {
  /** NavBar is hidden while the Hero is showing; visible once hero exits */
  showHero: boolean;
}

/** Hardcoded anchor link targets — derived from BentoGrid section ids */
const NAV_LINKS = [
  { label: 'timeline', href: '#professional-timeline', id: 'professional-timeline' },
  { label: 'projects', href: '#projects', id: 'projects' },
  { label: 'personal', href: '#personal', id: 'personal' },
  { label: 'hire', href: '#hire', id: 'hire' },
] as const;

const SECTION_IDS = NAV_LINKS.map((l) => l.id);

/**
 * NavBar — sticky navigation bar with anchor links to each BentoGrid section.
 *
 * Hidden (display: none + aria-hidden) while showHero === true to avoid
 * overlapping with the Hero boot sequence. Becomes visible once the Hero
 * exits and BentoGrid is shown.
 */
const NavBar: React.FC<NavBarProps> = ({ showHero }) => {
  const activeId = useActiveSection(SECTION_IDS);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
  };

  return (
    <AnimatePresence>
      {!showHero && (
        <motion.nav
          aria-label="Page sections"
          className="fixed top-0 left-0 right-0 z-50
                     bg-brand-bg/80 backdrop-blur-sm border-b border-brand-primary/20"
          data-testid="navbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Scroll wrapper: `w-max mx-auto` centers the list when it fits and
              scrolls when it doesn't. A centered flex container would clip both
              edges on narrow phones with no way to reach the cut-off links. */}
          <div
            className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <ul className="flex items-center gap-4 md:gap-6 w-max mx-auto list-none px-4 md:px-6 py-3">
            {NAV_LINKS.map(({ label, href, id }) => {
              const isActive = activeId === id;
              return (
                <li key={href}>
                  <a
                    href={href}
                    onClick={(e) => handleNavClick(e, id)}
                    aria-label={`Navigate to ${label} section`}
                    aria-current={isActive ? 'true' : undefined}
                    className={
                      'font-mono text-xs whitespace-nowrap transition-colors duration-150 select-none ' +
                      'border-b border-transparent pb-0.5 ' +
                      (isActive
                        ? 'text-brand-primary border-brand-primary'
                        : 'text-brand-text hover:text-brand-primary')
                    }
                    data-testid={`nav-link-${label}`}
                  >
                    {/* `// ` prefix hidden on phones — the 5 items don't fit at 390px with it */}
                    <span className="hidden sm:inline">{'// '}</span>
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default NavBar;

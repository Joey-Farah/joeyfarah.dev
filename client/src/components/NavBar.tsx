import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveSection } from './useActiveSection';

export interface NavBarProps {
  /** NavBar is hidden while the Hero is showing; visible once hero exits */
  showHero: boolean;
}

/** Hardcoded anchor link targets — derived from BentoGrid section ids */
const NAV_LINKS = [
  { label: 'professional', href: '#professional', id: 'professional' },
  { label: 'enterprise', href: '#enterprise', id: 'enterprise' },
  { label: 'projects', href: '#projects', id: 'projects' },
  { label: 'contact', href: '#contact', id: 'contact' },
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

  return (
    <AnimatePresence>
      {!showHero && (
        <motion.nav
          aria-label="Page sections"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center
                     bg-brand-bg/80 backdrop-blur-sm border-b border-brand-primary/20
                     px-6 py-3"
          data-testid="navbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ul className="flex items-center gap-6 list-none m-0 p-0">
            {NAV_LINKS.map(({ label, href, id }) => {
              const isActive = activeId === id;
              return (
                <li key={href}>
                  <a
                    href={href}
                    aria-label={`Navigate to ${label} section`}
                    aria-current={isActive ? 'true' : undefined}
                    className={
                      'font-mono text-xs transition-colors duration-150 select-none ' +
                      'border-b border-transparent pb-0.5 ' +
                      (isActive
                        ? 'text-brand-primary border-brand-primary'
                        : 'text-brand-text hover:text-brand-primary')
                    }
                    data-testid={`nav-link-${label}`}
                  >
                    {'// '}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default NavBar;

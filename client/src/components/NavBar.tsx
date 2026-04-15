import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavBarProps {
  /** NavBar is hidden while the Hero is showing; visible once hero exits */
  showHero: boolean;
}

/** Hardcoded anchor link targets — derived from BentoGrid section ids */
const NAV_LINKS = [
  { label: 'professional', href: '#professional' },
  { label: 'enterprise', href: '#enterprise' },
  { label: 'projects', href: '#projects' },
  { label: 'contact', href: '#contact' },
] as const;

/**
 * NavBar — sticky navigation bar with anchor links to each BentoGrid section.
 *
 * Hidden (display: none + aria-hidden) while showHero === true to avoid
 * overlapping with the Hero boot sequence. Becomes visible once the Hero
 * exits and BentoGrid is shown.
 */
const NavBar: React.FC<NavBarProps> = ({ showHero }) => {
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
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  aria-label={`Navigate to ${label} section`}
                  className="font-mono text-xs text-brand-text hover:text-brand-primary
                             transition-colors duration-150 select-none"
                  data-testid={`nav-link-${label}`}
                >
                  {'// '}
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default NavBar;

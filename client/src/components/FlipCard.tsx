import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface FlipCardProps {
  /** Preview face — shown first. The whole face is the flip trigger. */
  front: React.ReactNode;
  /** Detail face — revealed on flip. Renders its own "back" control. */
  back: React.ReactNode;
  /** Used for accessible labels on the flip controls. */
  title: string;
}

/**
 * FlipCard — a click-to-flip 3D card. Both faces live in the same grid cell so
 * the card auto-sizes to the taller face (no jump on flip) and both stay in the
 * DOM (crawlable, and reachable by keyboard once flipped).
 *
 * Front is a button that flips to the back; the back renders a small "↺ back"
 * control. Honors prefers-reduced-motion by snapping instead of spinning.
 */
const FlipCard: React.FC<FlipCardProps> = ({ front, back, title }) => {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-1 [perspective:1200px]">
      <motion.div
        data-testid="flip-inner"
        className="relative grid w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeInOut' }}
      >
        {/* FRONT */}
        <button
          type="button"
          onClick={() => setFlipped(true)}
          aria-expanded={flipped}
          aria-label={`Show details for ${title}`}
          className="[grid-area:1/1] [backface-visibility:hidden] flex flex-col text-left cursor-pointer
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 rounded-lg"
        >
          {front}
        </button>

        {/* BACK */}
        <div
          aria-hidden={!flipped}
          className="[grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)] relative flex flex-col"
        >
          {back}
          <button
            type="button"
            onClick={() => setFlipped(false)}
            aria-label={`Hide details for ${title}`}
            tabIndex={flipped ? 0 : -1}
            className="absolute top-2 right-2 z-10 font-mono text-xs text-brand-primary/70 hover:text-brand-primary
                       px-1.5 py-0.5 rounded border border-brand-primary/30 bg-brand-bg/80 backdrop-blur-sm
                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
          >
            {'↺ back'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;

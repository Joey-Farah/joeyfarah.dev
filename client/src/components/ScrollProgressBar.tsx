import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * ScrollProgressBar — thin fixed bar at the top of the viewport that fills
 * as the user scrolls down the page. Uses Framer Motion useScroll + useSpring
 * for smooth animation.
 */
const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: '#06b6d4',
        transformOrigin: '0%',
        zIndex: 60,
        opacity: 0.8,
      }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgressBar;

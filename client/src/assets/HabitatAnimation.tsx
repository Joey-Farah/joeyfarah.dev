/**
 * HabitatAnimation — CSS/SVG plant growth animation placeholder.
 *
 * Lottie v1 fallback per PRD. Represents a growing plant via CSS keyframe
 * animation on SVG elements. No external dependencies — pure React + CSS.
 *
 * The animation loops continuously: stem grows upward, leaves unfurl,
 * and the pot sits at the base. Visually communicates "plant growth tracking".
 */

import React from 'react';

const KEYFRAMES = `
@keyframes habitat-stem-grow {
  0%   { transform: scaleY(0);   transform-origin: bottom center; }
  60%  { transform: scaleY(1);   transform-origin: bottom center; }
  100% { transform: scaleY(1);   transform-origin: bottom center; }
}
@keyframes habitat-leaf-left {
  0%   { opacity: 0; transform: scale(0) rotate(-30deg); transform-origin: right bottom; }
  40%  { opacity: 0; transform: scale(0) rotate(-30deg); transform-origin: right bottom; }
  70%  { opacity: 1; transform: scale(1) rotate(-30deg); transform-origin: right bottom; }
  100% { opacity: 1; transform: scale(1) rotate(-30deg); transform-origin: right bottom; }
}
@keyframes habitat-leaf-right {
  0%   { opacity: 0; transform: scale(0) rotate(30deg); transform-origin: left bottom; }
  50%  { opacity: 0; transform: scale(0) rotate(30deg); transform-origin: left bottom; }
  80%  { opacity: 1; transform: scale(1) rotate(30deg); transform-origin: left bottom; }
  100% { opacity: 1; transform: scale(1) rotate(30deg); transform-origin: left bottom; }
}
@keyframes habitat-sprout {
  0%   { opacity: 0; transform: scale(0); transform-origin: center bottom; }
  70%  { opacity: 0; transform: scale(0); transform-origin: center bottom; }
  100% { opacity: 1; transform: scale(1); transform-origin: center bottom; }
}
@keyframes habitat-glow {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1.0; }
}
`;

const HabitatAnimation: React.FC = () => {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <svg
        data-testid="habitat-animation"
        viewBox="0 0 80 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Plant growth animation"
        role="img"
        style={{ width: '80px', height: '100px', display: 'block' }}
      >
        {/* Pot body */}
        <polygon
          points="18,90 62,90 56,72 24,72"
          fill="#7c3f1e"
          opacity="0.85"
        />
        {/* Pot rim */}
        <rect x="16" y="68" width="48" height="6" rx="2" fill="#9e5128" />
        {/* Soil */}
        <ellipse cx="40" cy="71" rx="18" ry="3.5" fill="#4a2c0a" opacity="0.9" />

        {/* Stem — grows upward from pot */}
        <rect
          x="38.5"
          y="20"
          width="3"
          height="52"
          rx="1.5"
          fill="#22c55e"
          style={{
            animation: 'habitat-stem-grow 2s ease-out infinite',
            animationDelay: '0.1s',
          }}
        />

        {/* Left leaf */}
        <ellipse
          cx="28"
          cy="52"
          rx="12"
          ry="6"
          fill="#16a34a"
          style={{
            animation: 'habitat-leaf-left 2s ease-out infinite',
          }}
        />

        {/* Right leaf */}
        <ellipse
          cx="52"
          cy="42"
          rx="12"
          ry="6"
          fill="#15803d"
          style={{
            animation: 'habitat-leaf-right 2s ease-out infinite',
          }}
        />

        {/* Top sprout / bud */}
        <ellipse
          cx="40"
          cy="18"
          rx="5"
          ry="7"
          fill="#4ade80"
          style={{
            animation: 'habitat-sprout 2s ease-out infinite',
          }}
        />

        {/* Ambient glow dots — soil moisture indicator */}
        <circle
          cx="32"
          cy="69"
          r="1.5"
          fill="#06b6d4"
          style={{ animation: 'habitat-glow 1.8s ease-in-out infinite' }}
        />
        <circle
          cx="40"
          cy="70"
          r="1.5"
          fill="#06b6d4"
          style={{ animation: 'habitat-glow 1.8s ease-in-out infinite', animationDelay: '0.4s' }}
        />
        <circle
          cx="48"
          cy="69"
          r="1.5"
          fill="#06b6d4"
          style={{ animation: 'habitat-glow 1.8s ease-in-out infinite', animationDelay: '0.8s' }}
        />
      </svg>
    </>
  );
};

export default HabitatAnimation;

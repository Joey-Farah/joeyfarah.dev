import React from 'react';

// Keep in sync with the preload link in client/index.html.
export const HEADSHOT_SRC = '/images/joey-headshot.webp';

/**
 * Joey's headshot in a terminal window, matching the BentoTile title-bar chrome.
 * Full uncropped portrait (2:3). Width tracks viewport height so the photo never
 * collides with the hero's "scroll to explore" hint, stacked on phones or beside the text.
 */
const HeadshotFrame: React.FC = () => (
  <figure className="w-[min(8rem,16dvh)] md:w-[min(20rem,40dvh)] shrink-0 bg-brand-bg border border-brand-primary/20 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(6,182,212,0.15)]">
    <div
      aria-hidden="true"
      className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-brand-primary/10"
    >
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#eab308' }} />
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
    </div>
    <img
      src={HEADSHOT_SRC}
      alt="Joey Farah"
      width={900}
      height={1353}
      decoding="async"
      className="block w-full h-auto"
    />
  </figure>
);

export default HeadshotFrame;

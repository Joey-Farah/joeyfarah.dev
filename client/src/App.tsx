import React, { useState, useEffect, useRef } from 'react';
import type { BentoBlock, HeroContent } from 'shared/types';
import { HttpBlockDataClient } from './adapters/BlockDataClient';
import ScrollTransitionOrchestrator from './modules/ScrollTransition/ScrollTransitionOrchestrator';
import IntroSection from './modules/IntroSection/IntroSection';
import WorkSection from './modules/WorkSection/WorkSection';
import NavBar from './components/NavBar';
import ScrollProgressBar from './components/ScrollProgressBar';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useKeyboardSectionNav } from './components/useKeyboardSectionNav';
import { shouldHideHero } from './lib/heroScroll';

const client = new HttpBlockDataClient();

function isHeroBlock(block: BentoBlock): block is BentoBlock & { content: HeroContent } {
  return block.type === 'hero';
}

const App: React.FC = () => {
  const [heroBlock, setHeroBlock] = useState<(BentoBlock & { content: HeroContent }) | null>(null);
  const [allBlocks, setAllBlocks] = useState<BentoBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // showHero drives both NavBar visibility and ScrollTransitionOrchestrator
  const [showHero, setShowHero] = useState(true);
  // Once hero has been dismissed, don't revert on scroll-up
  const hasTransitionedRef = useRef(false);

  useKeyboardSectionNav();

  // Fetch blocks on mount
  useEffect(() => {
    client
      .fetchBlocks()
      .then((blocks) => {
        const hero = blocks.find(isHeroBlock);
        if (hero) {
          setHeroBlock(hero);
        }
        setAllBlocks(blocks);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load blocks');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Honor deep links (e.g. the /work → /#build redirect): content renders
  // after the async fetch, so the browser's native hash-scroll misses it.
  useEffect(() => {
    if (loading || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Let the grid lay out first
    const t = setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 100);
    return () => clearTimeout(t);
  }, [loading]);

  // Scroll listener — tracks whether the hero has been scrolled past so NavBar
  // can appear. Hero's own opacity fade is handled inside ScrollTransitionOrchestrator.
  useEffect(() => {
    const handleScroll = () => {
      if (shouldHideHero(window.scrollY, window.innerHeight)) {
        hasTransitionedRef.current = true;
        setShowHero(false);
      } else if (!hasTransitionedRef.current) {
        setShowHero(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
        <p className="font-mono text-brand-primary">{'> booting...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
        <p className="font-mono text-red-400">{'> error: ' + error}</p>
      </div>
    );
  }

  if (!heroBlock) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
        <p className="font-mono text-brand-primary">{'> no hero block found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <a href="#main-content" className="skip-to-content">
        {'// skip to content'}
      </a>
      <ScrollProgressBar />
      {/* Sticky nav — hidden while Hero is showing */}
      <NavBar showHero={showHero} />
      <ScrollToTopButton />

      {/* ScrollTransitionOrchestrator — Hero → BentoGrid animated transition */}
      <main id="main-content">
        {/* Resume flow: joey (intro) → projects/timeline/personal (grid) → contact */}
        <ScrollTransitionOrchestrator
          heroBlock={heroBlock}
          blocks={allBlocks}
          showHero={showHero}
          afterHero={<IntroSection />}
        />
        {/* Contact close — sits last, after the work */}
        <WorkSection />
      </main>
    </div>
  );
};

export default App;

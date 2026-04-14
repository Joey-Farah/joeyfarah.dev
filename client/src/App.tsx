import React, { useState, useEffect, useRef } from 'react';
import type { BentoBlock, HeroContent } from 'shared/types';
import { HttpBlockDataClient } from './adapters/BlockDataClient';
import ScrollTransitionOrchestrator from './modules/ScrollTransition/ScrollTransitionOrchestrator';
import NavBar from './components/NavBar';

const client = new HttpBlockDataClient();

/** Scroll threshold mirrored from ScrollTransitionOrchestrator */
const SCROLL_THRESHOLD_PX = 80;

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

  // Scroll listener — lifted to App so NavBar and Orchestrator share the same state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD_PX) {
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
      {/* Sticky nav — hidden while Hero is showing */}
      <NavBar showHero={showHero} />

      {/* ScrollTransitionOrchestrator — Hero → BentoGrid animated transition */}
      <main>
        <ScrollTransitionOrchestrator
          heroBlock={heroBlock}
          blocks={allBlocks}
          showHero={showHero}
        />
      </main>
    </div>
  );
};

export default App;

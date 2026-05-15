import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SlippiStats {
  rating: number;
  wins: number;
  losses: number;
  globalRank: number | null;
  season: string | null;
  rankName: string;
}

const SlippiStatsTile: React.FC = () => {
  const [stats, setStats] = useState<SlippiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/slippi')
      .then((r) => r.json())
      .then((d) => { if (d.rating) setStats(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.a
      href="https://slippi.gg/user/joey-870"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Slippi profile (joey-870)"
      className="group block rounded-xl border border-brand-primary/30 bg-brand-bg overflow-hidden font-mono text-sm w-fit cursor-pointer hover:bg-brand-primary/5 transition-colors"
      whileHover={{ borderColor: 'rgba(6,182,212,0.7)', boxShadow: '0 0 22px rgba(6,182,212,0.18)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-brand-primary/10">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-brand-text/40">
          slippi ranked{stats?.season ? ` — ${stats.season}` : ''}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          live
        </span>
      </div>

      <div className="px-4 py-3 flex items-center gap-6 flex-wrap">
        {loading && (
          <span className="text-xs text-brand-text/30 animate-pulse">fetching...</span>
        )}
        {!loading && !stats && (
          <span className="text-xs text-brand-text/30">unavailable</span>
        )}
        {stats && (
          <>
            <div className="flex flex-col">
              <span className="text-xs text-brand-text/40">// rating</span>
              <span className="text-lg font-bold text-brand-primary leading-tight">
                {stats.rating.toLocaleString()}
              </span>
              <span className="text-xs text-brand-text/50 leading-tight">{stats.rankName}</span>
            </div>
            {stats.globalRank && (
              <div className="flex flex-col">
                <span className="text-xs text-brand-text/40">global rank</span>
                <span className="text-lg font-bold text-brand-text leading-tight">
                  #{stats.globalRank}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-brand-text/40">W / L</span>
              <span className="text-sm leading-tight">
                <span className="text-green-400 font-bold">{stats.wins}</span>
                <span className="text-brand-text/40"> / </span>
                <span className="text-red-400 font-bold">{stats.losses}</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-brand-text/40">win rate</span>
              <span className="text-sm font-bold text-brand-text/70 leading-tight">
                {Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-brand-primary/15 bg-brand-primary/[0.04] text-xs">
        <span className="text-brand-text/50">slippi.gg/user/joey-870</span>
        <span className="inline-flex items-center gap-1 text-brand-primary font-bold transition-transform group-hover:translate-x-0.5">
          view profile
          <span aria-hidden="true">↗</span>
        </span>
      </div>
    </motion.a>
  );
};

export default SlippiStatsTile;

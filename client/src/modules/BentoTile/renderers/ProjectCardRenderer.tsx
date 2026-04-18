import React, { useEffect, useState } from 'react';
import type { ProjectCardContent } from 'shared/types';
import HabitatAnimation from '../../../assets/HabitatAnimation';

interface SlippiStats {
  rating: number;
  wins: number;
  losses: number;
  globalRank: number | null;
}

const SlippiLiveStats: React.FC = () => {
  const [stats, setStats] = useState<SlippiStats | null>(null);

  useEffect(() => {
    fetch('/api/slippi')
      .then((r) => r.json())
      .then((d) => { if (d.rating) setStats(d); })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-4 border border-brand-primary/20 rounded px-3 py-2 bg-brand-primary/5 shrink-0">
      <div className="flex flex-col">
        <span className="font-mono text-xs text-brand-text/40">// live rating</span>
        <span className="font-mono text-sm font-bold text-brand-primary">{stats.rating.toLocaleString()}</span>
      </div>
      {stats.globalRank && (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-brand-text/40">global rank</span>
          <span className="font-mono text-sm font-bold text-brand-text">#{stats.globalRank}</span>
        </div>
      )}
      <div className="flex flex-col ml-auto">
        <span className="font-mono text-xs text-brand-text/40">W / L</span>
        <span className="font-mono text-xs text-brand-text/70">
          <span className="text-green-400">{stats.wins}</span>
          {' / '}
          <span className="text-red-400">{stats.losses}</span>
        </span>
      </div>
    </div>
  );
};

export interface ProjectCardRendererProps {
  content: ProjectCardContent;
  title: string;
  slug?: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: 'live' | 'in-development' }> = ({ status }) => {
  if (status === 'live') {
    return (
      <span
        data-testid="status-badge"
        className="inline-flex items-center gap-1.5 text-xs font-mono"
      >
        <span
          className="inline-block w-2 h-2 rounded-full bg-green-500"
          aria-hidden="true"
        />
        <span className="text-green-400">Live</span>
      </span>
    );
  }

  return (
    <span
      data-testid="status-badge"
      className="inline-flex items-center gap-1.5 text-xs font-mono"
    >
      <span
        className="inline-block w-2 h-2 rounded-full bg-yellow-400"
        aria-hidden="true"
      />
      <span className="text-yellow-300">In Development</span>
    </span>
  );
};

// ─── ProjectCardRenderer ──────────────────────────────────────────────────────

const ProjectCardRenderer: React.FC<ProjectCardRendererProps> = ({ content, title, slug }) => {
  const { description, stack, links, status, image } = content;
  const isHabitat = slug === 'habitat';

  return (
    <div
      data-testid="project-card-renderer"
      className="flex flex-col flex-1 p-4 gap-3 font-mono text-brand-text text-sm overflow-auto"
    >
      {/* Project image */}
      {image && (
        <div className="w-full flex items-center justify-center shrink-0">
          <img
            src={image}
            alt={title}
            className="max-h-[100px] max-w-full object-contain"
          />
        </div>
      )}

      {/* Live Slippi stats */}
      {slug === 'slippi-ranked-stats' && <SlippiLiveStats />}

      {/* Status badge */}
      <div className="shrink-0">
        <StatusBadge status={status} />
      </div>

      {/* Habitat plant growth animation (Lottie v1 fallback) */}
      {isHabitat && (
        <div className="flex justify-center shrink-0 py-1" aria-label="Plant growth visualization">
          <HabitatAnimation />
        </div>
      )}

      {/* Description */}
      <p className="text-brand-text/80 text-xs leading-relaxed">
        {description}
      </p>

      {/* Stack badges */}
      {stack.length > 0 && (
        <div className="flex flex-wrap gap-1 md:gap-1.5 shrink-0">
          {stack.map((tech) => (
            <span
              key={tech}
              data-testid="stack-badge"
              className="px-2 py-0.5 rounded-full text-xs font-mono text-white"
              style={{ backgroundColor: '#3b82f6' }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 shrink-0 mt-auto pt-1">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="project-link"
              className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded border border-brand-primary/40 text-brand-primary text-xs font-mono hover:bg-brand-primary/10 transition-colors"
            >
              {link.label}
              <span aria-hidden="true" className="text-brand-primary/60">↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectCardRenderer;

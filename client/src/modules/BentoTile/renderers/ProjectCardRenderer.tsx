import React from 'react';
import type { ProjectCardContent } from 'shared/types';
import HabitatAnimation from '../../../assets/HabitatAnimation';

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

// ─── Progress bar (in-development cards) ──────────────────────────────────────

const PROGRESS_CELLS = 20;

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const pct = Math.round(Math.max(0, Math.min(100, progress)));
  const filled = Math.round((pct / 100) * PROGRESS_CELLS);

  return (
    <div
      data-testid="progress-bar"
      className="flex items-center gap-2 text-xs font-mono shrink-0"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${pct}% complete`}
    >
      <span className="tracking-tighter" aria-hidden="true">
        <span className="text-brand-primary/60">[</span>
        <span className="text-brand-primary">{'█'.repeat(filled)}</span>
        <span className="text-brand-text/25">{'░'.repeat(PROGRESS_CELLS - filled)}</span>
        <span className="text-brand-primary/60">]</span>
      </span>
      <span className="text-brand-text/70">{pct}%</span>
    </div>
  );
};

// ─── ProjectCardRenderer ──────────────────────────────────────────────────────

const ProjectCardRenderer: React.FC<ProjectCardRendererProps> = ({ content, title, slug }) => {
  const { description, stack, links, status, image, progress } = content;
  const isHabitat = slug === 'habitat';
  // Wide tiles (colSpan 2) get side-by-side media + text on md+ screens.
  const isWideMedia = slug === 'oracle-db-diagram';

  return (
    <div
      data-testid="project-card-renderer"
      className={`flex flex-1 p-4 gap-3 font-mono text-brand-text text-sm overflow-auto ${
        isWideMedia ? 'flex-col md:flex-row md:gap-5 md:items-stretch' : 'flex-col'
      }`}
    >
      {/* Project image */}
      {image && (
        <div
          className={`flex items-center justify-center shrink-0 ${
            isWideMedia ? 'w-full md:w-2/5' : 'w-full'
          }`}
        >
          <img
            src={image}
            alt={title}
            className={`max-w-full object-contain ${
              isWideMedia ? 'max-h-[140px] md:max-h-none md:w-full md:h-full' : 'max-h-[100px]'
            }`}
          />
        </div>
      )}

      <div className={`flex flex-col gap-3 min-w-0 ${isWideMedia ? 'md:flex-1' : 'flex-1'}`}>
        {/* Status badge */}
        <div className="shrink-0">
          <StatusBadge status={status} />
        </div>

        {/* Progress bar — only for in-development cards that declare a % */}
        {status === 'in-development' && progress !== undefined && (
          <ProgressBar progress={progress} />
        )}

        {/* Habitat plant growth animation (Lottie v1 fallback) */}
        {isHabitat && (
          <div className="flex justify-center shrink-0 py-1" aria-label="Plant growth visualization">
            <HabitatAnimation />
          </div>
        )}

        {/* Description */}
        <p className="text-brand-text/90 text-xs leading-relaxed">
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
    </div>
  );
};

export default ProjectCardRenderer;

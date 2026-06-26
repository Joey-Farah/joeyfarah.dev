import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useInView, animate } from 'framer-motion';
import type { ProjectCardContent } from 'shared/types';
import HabitatAnimation from '../../../assets/HabitatAnimation';
import FlipCard from '../../../components/FlipCard';

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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  // Fills from 0 → pct when scrolled into view (mirrors the stats CountUp).
  // aria-valuenow stays pinned to the real target so the value is always correct.
  const [display, setDisplay] = useState(reduce ? pct : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, pct, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, pct, reduce]);

  const filled = Math.round((display / 100) * PROGRESS_CELLS);

  return (
    <div
      ref={ref}
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
      <span className="text-brand-text/70 tabular-nums">{display}%</span>
    </div>
  );
};

// ─── Glyph fallback (front face for imageless cards) ──────────────────────────

const GlyphFallback: React.FC<{ label: string }> = ({ label }) => (
  <div
    className="flex flex-col items-center justify-center gap-2 select-none text-brand-primary/80"
    aria-hidden="true"
  >
    <span className="text-4xl font-bold tracking-tight">{'>_'}</span>
    <span className="font-mono text-sm text-brand-text/75">{label}</span>
    <span className="font-mono text-xs tracking-tighter text-brand-primary/40">{'▓▓▓░░░ db'}</span>
  </div>
);

// ─── Card faces ───────────────────────────────────────────────────────────────

const CardFront: React.FC<{
  title: string;
  status: 'live' | 'in-development';
  image?: string;
  fallbackLabel: string;
}> = ({ title, status, image, fallbackLabel }) => (
  <div className="flex flex-col flex-1 p-4 gap-3 font-mono text-brand-text">
    <div className="shrink-0">
      <StatusBadge status={status} />
    </div>
    <div className="flex flex-1 items-center justify-center min-h-[180px]">
      {image ? (
        <img src={image} alt={title} className="w-full max-h-[260px] object-contain" />
      ) : (
        <GlyphFallback label={fallbackLabel} />
      )}
    </div>
    <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-brand-primary/70">
      <span aria-hidden="true">↻</span>
      <span>details</span>
    </div>
  </div>
);

const CardBack: React.FC<{
  content: ProjectCardContent;
  isHabitat: boolean;
}> = ({ content, isHabitat }) => {
  const { description, stack, links, status, progress } = content;
  return (
    <div className="flex flex-col flex-1 p-4 gap-3 font-mono text-brand-text text-sm overflow-auto">
      <div className="shrink-0 pr-12">
        <StatusBadge status={status} />
      </div>

      {status === 'in-development' && progress !== undefined && (
        <ProgressBar progress={progress} />
      )}

      {isHabitat && (
        <div className="flex justify-center shrink-0 py-1" aria-label="Plant growth visualization">
          <HabitatAnimation />
        </div>
      )}

      <p className="text-brand-text/90 text-xs leading-relaxed">{description}</p>

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

// ─── ProjectCardRenderer ──────────────────────────────────────────────────────

const ProjectCardRenderer: React.FC<ProjectCardRendererProps> = ({ content, title, slug }) => {
  const { image, status } = content;
  const isHabitat = slug === 'habitat';

  return (
    <div data-testid="project-card-renderer" className="flex flex-1">
      <FlipCard
        title={title}
        front={
          <CardFront title={title} status={status} image={image} fallbackLabel={slug ?? title} />
        }
        back={<CardBack content={content} isHabitat={isHabitat} />}
      />
    </div>
  );
};

export default ProjectCardRenderer;

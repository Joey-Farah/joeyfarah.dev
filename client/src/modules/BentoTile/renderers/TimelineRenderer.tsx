import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { TimelineContent, TimelineEntry } from 'shared/types';

export interface TimelineRendererProps {
  content: TimelineContent;
  title: string;
}

// ─── Date formatting ─────────────────────────────────────────────────────────

/**
 * Formats an ISO month string (YYYY-MM) or "present" into a human-readable label.
 * e.g. "2022-07" → "Jul 2022", "present" → "Present"
 */
function formatDate(raw: string): string {
  if (raw.toLowerCase() === 'present') return 'Present';
  const [year, month] = raw.split('-');
  if (!year || !month) return raw;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ─── Single animated entry ───────────────────────────────────────────────────

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  index: number;
  reducedMotion: boolean;
}

const TimelineEntryCard: React.FC<TimelineEntryCardProps> = ({
  entry,
  index,
  reducedMotion,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });

  const visible = reducedMotion || inView;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
        transition: {
          duration: 0.45,
          ease: 'easeOut',
          delay: index * 0.1,
        },
      };

  const startLabel = formatDate(entry.start);
  const endLabel = formatDate(entry.end);
  const tenure = `${startLabel} — ${endLabel}`;

  return (
    <div ref={ref} className="relative flex gap-3">
      {/* Connector dot */}
      <div className="flex flex-col items-center shrink-0" aria-hidden="true">
        <span
          className="w-2.5 h-2.5 rounded-full border-2 mt-1 shrink-0"
          style={{ borderColor: '#06b6d4', backgroundColor: '#06b6d4' }}
        />
        {/* Vertical line below the dot — always shown except last entry styling
            is handled by the parent list's CSS */}
        <span className="flex-1 w-px bg-brand-primary/20 mt-1" />
      </div>

      {/* Card content */}
      <motion.div
        {...motionProps}
        className="pb-6 flex-1 min-w-0"
      >
        {/* Employer + role */}
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase mb-0.5"
          style={{ color: '#06b6d4' }}
        >
          {entry.employer}
        </p>
        <p className="font-sans text-sm font-semibold text-brand-text leading-snug">
          {entry.role}
        </p>

        {/* Tenure dates */}
        <p
          className="font-mono text-xs mt-0.5 mb-2"
          style={{ color: '#06b6d4', opacity: 0.75 }}
        >
          {tenure}
        </p>

        {/* Accomplishments */}
        <ul className="space-y-1.5">
          {entry.accomplishments.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 font-sans text-xs leading-relaxed"
              style={{ color: 'var(--brand-text, #e2e8f0)' }}
            >
              <span
                className="shrink-0 mt-0.5 font-mono"
                style={{ color: '#06b6d4' }}
                aria-hidden="true"
              >
                ›
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

// ─── Main renderer ────────────────────────────────────────────────────────────

const TimelineRenderer: React.FC<TimelineRendererProps> = ({ content }) => {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div
      data-testid="timeline-renderer"
      className="flex-1 p-4 overflow-auto"
    >
      {content.entries.length === 0 ? (
        <p className="font-mono text-xs text-brand-text/40">
          {'// no timeline entries'}
        </p>
      ) : (
        <div className="relative">
          {content.entries.map((entry, index) => (
            <TimelineEntryCard
              key={`${entry.employer}-${entry.start}`}
              entry={entry}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineRenderer;

import React from 'react';
import type { DualTimelineContent, DualTimelineEntry } from 'shared/types';

interface DualTimelineProps {
  content: DualTimelineContent;
}

const Entry: React.FC<{ entry: DualTimelineEntry; side: 'left' | 'right' }> = ({ entry, side }) => {
  const isRight = side === 'right';

  const label = (
    <span className="font-mono text-xs md:text-sm text-brand-text/80 leading-snug">
      {entry.label}
    </span>
  );

  return (
    <div className={`flex flex-col gap-0.5 ${isRight ? 'items-start' : 'items-end'}`}>
      {label}
      {entry.detail && (
        entry.href ? (
          <a
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-brand-primary/60 hover:text-brand-primary leading-snug transition-colors"
          >
            {entry.detail} ↗
          </a>
        ) : (
          <span className="font-mono text-xs text-brand-text/40 leading-snug">{entry.detail}</span>
        )
      )}
    </div>
  );
};

const DualTimeline: React.FC<DualTimelineProps> = ({ content }) => {
  const { left, right } = content;

  const allYears = Array.from(
    new Set([...left.map((e) => e.year), ...right.map((e) => e.year)]),
  ).sort();

  const leftByYear = Object.fromEntries(
    allYears.map((y) => [y, left.filter((e) => e.year === y)]),
  );
  const rightByYear = Object.fromEntries(
    allYears.map((y) => [y, right.filter((e) => e.year === y)]),
  );

  return (
    <div className="w-full px-2 md:px-4 py-6">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_56px_1fr] md:grid-cols-[1fr_72px_1fr] gap-2 mb-6">
        <p className="font-mono text-xs text-brand-text/40 text-right">// professional</p>
        <div />
        <p className="font-mono text-xs text-brand-text/40">// personal</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Continuous center line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-brand-primary/20"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="flex flex-col gap-6">
          {allYears.map((year) => {
            const leftEntries = leftByYear[year] ?? [];
            const rightEntries = rightByYear[year] ?? [];

            return (
              <div
                key={year}
                className="grid grid-cols-[1fr_56px_1fr] md:grid-cols-[1fr_72px_1fr] gap-2 items-start"
              >
                {/* Left entries */}
                <div className="flex flex-col gap-2 items-end pr-3 md:pr-4">
                  {leftEntries.map((e) => (
                    <Entry key={e.label} entry={e} side="left" />
                  ))}
                </div>

                {/* Year marker */}
                <div className="flex justify-center pt-0.5">
                  <span className="relative z-10 font-mono text-xs text-brand-primary/50 bg-brand-bg px-1">
                    {year}
                  </span>
                </div>

                {/* Right entries */}
                <div className="flex flex-col gap-2 items-start pl-3 md:pl-4">
                  {rightEntries.map((e) => (
                    <Entry key={e.label} entry={e} side="right" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DualTimeline;

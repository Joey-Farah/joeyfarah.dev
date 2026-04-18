import React from 'react';
import type { ReadingListContent } from 'shared/types';

export interface ReadingListRendererProps {
  content: ReadingListContent;
}

const ReadingListRenderer: React.FC<ReadingListRendererProps> = ({ content }) => {
  const { current, next, recent } = content;

  return (
    <div
      data-testid="reading-list-renderer"
      className="flex flex-col md:flex-row flex-1 p-4 gap-6 font-mono overflow-auto"
    >
      {/* Currently reading */}
      <div className="md:w-1/4 shrink-0">
        <p className="text-brand-text/40 text-xs mb-1">// currently reading</p>
        <p className="text-brand-primary text-sm font-semibold leading-snug">{current}</p>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-brand-primary/10 shrink-0" />

      {/* Up next */}
      <div className="md:w-1/4 shrink-0">
        <p className="text-brand-text/40 text-xs mb-2">// up next</p>
        <ol className="space-y-1.5">
          {next.map((book, i) => (
            <li key={book} className="flex gap-2 text-xs text-brand-text/80 leading-snug">
              <span className="text-brand-primary/40 shrink-0 w-4">{i + 1}.</span>
              {book}
            </li>
          ))}
        </ol>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-brand-primary/10 shrink-0" />

      {/* Recently read */}
      <div className="flex-1">
        <p className="text-brand-text/40 text-xs mb-2">// recently read</p>
        <div className="flex flex-wrap gap-1.5">
          {recent.map((book) => (
            <span
              key={book}
              className="text-xs text-brand-text/60 border border-brand-primary/15 px-2 py-0.5 rounded"
            >
              {book}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingListRenderer;

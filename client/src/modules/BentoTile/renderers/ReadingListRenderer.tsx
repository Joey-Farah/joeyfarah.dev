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
        <p className="text-brand-primary text-sm font-semibold leading-snug">{current.title}</p>
        <p className="text-brand-text/40 text-xs mt-0.5">{current.author}</p>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-brand-primary/10 shrink-0" />

      {/* Up next */}
      <div className="md:w-1/4 shrink-0">
        <p className="text-brand-text/40 text-xs mb-2">// up next</p>
        <ol className="space-y-2">
          {next.map((book, i) => (
            <li key={book.title} className="flex gap-2 leading-snug">
              <span className="text-brand-primary/40 shrink-0 w-4 text-xs">{i + 1}.</span>
              <span className="flex flex-col">
                <span className="text-xs text-brand-text/80">{book.title}</span>
                <span className="text-xs text-brand-text/40">{book.author}</span>
              </span>
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
              key={book.title}
              className="flex flex-col border border-brand-primary/15 px-2 py-1 rounded"
            >
              <span className="text-xs text-brand-text/60">{book.title}</span>
              <span className="text-xs text-brand-text/30">{book.author}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingListRenderer;

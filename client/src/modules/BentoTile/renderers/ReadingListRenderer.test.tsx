import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReadingListContent } from 'shared/types';
import ReadingListRenderer from './ReadingListRenderer';

const base: ReadingListContent = {
  current: { title: 'Fever Pitch', author: 'Nick Hornby' },
  next: [{ title: 'The Stand', author: 'Stephen King' }],
  recent: [{ title: 'Dune', author: 'Frank Herbert' }],
};

describe('ReadingListRenderer — current book description', () => {
  it('shows the description under the book currently being read', () => {
    render(
      <ReadingListRenderer
        content={{ ...base, current: { ...base.current, description: 'A football memoir.' } }}
      />,
    );
    expect(screen.getByText('A football memoir.')).toBeInTheDocument();
  });

  it('does not show descriptions for up-next or recently-read books', () => {
    render(
      <ReadingListRenderer
        content={{
          ...base,
          next: [{ ...base.next[0], description: 'Next blurb.' }],
          recent: [{ ...base.recent[0], description: 'Recent blurb.' }],
        }}
      />,
    );
    expect(screen.queryByText('Next blurb.')).not.toBeInTheDocument();
    expect(screen.queryByText('Recent blurb.')).not.toBeInTheDocument();
  });
});

import React from 'react';
import type { MusicListContent } from 'shared/types';

export interface MusicListRendererProps {
  content: MusicListContent;
}

const MusicListRenderer: React.FC<MusicListRendererProps> = ({ content }) => {
  const { albums } = content;

  return (
    <div
      data-testid="music-list-renderer"
      className="flex flex-col flex-1 p-4 gap-3 font-mono overflow-auto"
    >
      <p className="text-brand-text/40 text-xs shrink-0">// {albums.length} albums</p>
      <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2.5">
        {albums.map((album) => (
          <li key={album.title} className="flex flex-col gap-0 min-w-0">
            <span className="text-xs text-brand-text/90 leading-snug truncate">{album.title}</span>
            <span className="text-xs text-brand-text/40 leading-snug truncate">{album.artist}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MusicListRenderer;

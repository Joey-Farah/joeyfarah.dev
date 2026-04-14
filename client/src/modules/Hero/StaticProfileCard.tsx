import React from 'react';
import type { HeroContent } from 'shared/types';

interface StaticProfileCardProps {
  lines: HeroContent['lines'];
}

const StaticProfileCard: React.FC<StaticProfileCardProps> = ({ lines }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-brand-bg px-6"
      data-testid="static-profile-card"
    >
      <div className="font-mono text-brand-text space-y-2">
        <div className="text-brand-primary text-xs mb-4 select-none">
          {'> profile.txt'}
        </div>
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-brand-text leading-relaxed"
            data-testid={`profile-line-${i}`}
          >
            {line}
          </p>
        ))}
        <div className="text-brand-primary text-xs mt-4 select-none">
          {'[reduced-motion mode]'}
        </div>
      </div>
    </div>
  );
};

export default StaticProfileCard;

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ProjectCardContent } from 'shared/types';
import ProjectCardRenderer from './ProjectCardRenderer';

const base: ProjectCardContent = {
  description: 'A test project.',
  stack: ['Go'],
  links: [],
  status: 'in-development',
};

describe('ProjectCardRenderer — progress bar', () => {
  it('renders a progress bar for an in-development card with a progress value', () => {
    render(<ProjectCardRenderer content={{ ...base, progress: 15 }} title="rslp" />);
    const bar = screen.getByRole('progressbar');
    // aria-valuenow is pinned to the true target (the visible fill animates in).
    expect(bar).toHaveAttribute('aria-valuenow', '15');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits the progress bar when progress is not set', () => {
    render(<ProjectCardRenderer content={base} title="rslp" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('omits the progress bar on live cards even if progress is present', () => {
    render(
      <ProjectCardRenderer
        content={{ ...base, status: 'live', progress: 80 }}
        title="rslp"
      />,
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('clamps and rounds the percentage', () => {
    render(<ProjectCardRenderer content={{ ...base, progress: 150 }} title="rslp" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});

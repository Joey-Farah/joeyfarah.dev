import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ProjectCardContent } from 'shared/types';
import ProjectCardRenderer from './ProjectCardRenderer';

const base: ProjectCardContent = {
  description: 'A test project.',
  stack: ['Go'],
  links: [{ label: 'GitHub', url: 'https://example.com' }],
  status: 'in-development',
};

describe('ProjectCardRenderer — flip card', () => {
  it('starts on the front face (collapsed) with a flip trigger', () => {
    render(<ProjectCardRenderer content={base} title="rslp" />);
    const trigger = screen.getByRole('button', { name: /show details for rslp/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('flips to reveal details when the front is clicked', () => {
    render(<ProjectCardRenderer content={base} title="rslp" />);
    fireEvent.click(screen.getByRole('button', { name: /show details for rslp/i }));
    expect(
      screen.getByRole('button', { name: /show details for rslp/i }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders the image on the front when one is provided', () => {
    render(
      <ProjectCardRenderer content={{ ...base, image: '/images/x.svg' }} title="rslp" />,
    );
    expect(screen.getByRole('img', { name: 'rslp' })).toHaveAttribute('src', '/images/x.svg');
  });

  it('falls back to a glyph front (no img) when there is no image', () => {
    render(<ProjectCardRenderer content={base} title="rslp" slug="rslp" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps detail content (description, stack, links) in the DOM for both faces', () => {
    render(<ProjectCardRenderer content={base} title="rslp" />);
    expect(screen.getByText('A test project.')).toBeInTheDocument();
    expect(screen.getByTestId('stack-badge')).toHaveTextContent('Go');
    expect(screen.getByTestId('project-link')).toHaveAttribute('href', 'https://example.com');
  });
});

describe('ProjectCardRenderer — progress bar', () => {
  // The bar lives on the back (detail) face, which is aria-hidden until flipped,
  // so these query with { hidden: true } to assert rendering regardless of face.
  it('renders a progress bar for an in-development card with a progress value', () => {
    render(<ProjectCardRenderer content={{ ...base, progress: 15 }} title="rslp" />);
    const bar = screen.getByRole('progressbar', { hidden: true });
    // aria-valuenow is pinned to the true target (the visible fill animates in).
    expect(bar).toHaveAttribute('aria-valuenow', '15');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits the progress bar when progress is not set', () => {
    render(<ProjectCardRenderer content={base} title="rslp" />);
    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
  });

  it('omits the progress bar on live cards even if progress is present', () => {
    render(
      <ProjectCardRenderer
        content={{ ...base, status: 'live', progress: 80 }}
        title="rslp"
      />,
    );
    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
  });

  it('clamps and rounds the percentage', () => {
    render(<ProjectCardRenderer content={{ ...base, progress: 150 }} title="rslp" />);
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute('aria-valuenow', '100');
  });
});

// Envelope — every block the API returns has this shape
export interface BentoBlock {
  slug: string;
  type: 'hero' | 'timeline' | 'dual-timeline' | 'erd-tile' | 'project-card' | 'contact-links';
  title: string;
  order: number;
  visible: boolean;
  content: HeroContent | TimelineContent | DualTimelineContent | ErdTileContent | ProjectCardContent | ContactLinksContent;
}

export interface HeroContent {
  lines: string[];
}

export interface TimelineEntry {
  employer: string;
  role: string;
  start: string;
  end: string;
  accomplishments: string[];
}

export interface TimelineContent {
  entries: TimelineEntry[];
}

export interface DualTimelineEntry {
  year: string;
  label: string;
  detail?: string;
  slug?: string;
  href?: string;
}

export interface DualTimelineContent {
  left: DualTimelineEntry[];
  right: DualTimelineEntry[];
}

export interface ErdNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface ErdEdge {
  from: string;
  to: string;
  label: string;
}

export interface ErdTileContent {
  description: string;
  nodes: ErdNode[];
  edges: ErdEdge[];
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectCardContent {
  description: string;
  stack: string[];
  links: ProjectLink[];
  status: 'live' | 'in-development';
}

export interface ContactLink {
  platform: string;
  url: string;
  display: string;
}

export interface ContactLinksContent {
  links: ContactLink[];
}

export interface LayoutConfig {
  colSpan?: number;
  rowSpan?: number;
}

import { z } from 'zod';

const HeroContentSchema = z.object({
  lines: z.array(z.string()).min(1),
});

const TimelineEntrySchema = z.object({
  employer: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  accomplishments: z.array(z.string()),
});

const TimelineContentSchema = z.object({
  entries: z.array(TimelineEntrySchema).min(1),
});

const DualTimelineEntrySchema = z.object({
  year: z.string(),
  label: z.string(),
  detail: z.string().optional(),
  slug: z.string().optional(),
  href: z.string().optional(),
});

const DualTimelineContentSchema = z.object({
  left: z.array(DualTimelineEntrySchema),
  right: z.array(DualTimelineEntrySchema),
});

const ErdNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number(),
});

const ErdEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
});

const ErdTileContentSchema = z.object({
  description: z.string(),
  nodes: z.array(ErdNodeSchema).min(1),
  edges: z.array(ErdEdgeSchema),
  status: z.enum(['live', 'in-development']).optional(),
});

const ProjectLinkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

const ProjectCardContentSchema = z.object({
  description: z.string(),
  stack: z.array(z.string()),
  links: z.array(ProjectLinkSchema),
  status: z.enum(['live', 'in-development']),
});

const ContactLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
  display: z.string(),
});

const ContactLinksContentSchema = z.object({
  links: z.array(ContactLinkSchema).min(1),
});

const ReadingListBookSchema = z.object({
  title: z.string(),
  author: z.string(),
});

const ReadingListContentSchema = z.object({
  current: ReadingListBookSchema,
  next: z.array(ReadingListBookSchema),
  recent: z.array(ReadingListBookSchema),
});

const MusicAlbumSchema = z.object({
  title: z.string(),
  artist: z.string(),
});

const MusicListContentSchema = z.object({
  albums: z.array(MusicAlbumSchema).min(1),
});

export const BentoBlockSchema = z.discriminatedUnion('type', [
  z.object({
    slug: z.string(),
    type: z.literal('hero'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: HeroContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('timeline'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: TimelineContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('dual-timeline'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: DualTimelineContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('erd-tile'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: ErdTileContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('project-card'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: ProjectCardContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('contact-links'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: ContactLinksContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('reading-list'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: ReadingListContentSchema,
  }),
  z.object({
    slug: z.string(),
    type: z.literal('music-list'),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean(),
    content: MusicListContentSchema,
  }),
]);

export const BentoBlockArraySchema = z.array(BentoBlockSchema);

export type BentoBlockSchemaType = z.infer<typeof BentoBlockSchema>;
export type BentoBlockArraySchemaType = z.infer<typeof BentoBlockArraySchema>;

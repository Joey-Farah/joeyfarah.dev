"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BentoBlockArraySchema = exports.BentoBlockSchema = void 0;
const zod_1 = require("zod");
const HeroContentSchema = zod_1.z.object({
    lines: zod_1.z.array(zod_1.z.string()).min(1),
});
const TimelineEntrySchema = zod_1.z.object({
    employer: zod_1.z.string(),
    role: zod_1.z.string(),
    start: zod_1.z.string(),
    end: zod_1.z.string(),
    accomplishments: zod_1.z.array(zod_1.z.string()),
});
const TimelineContentSchema = zod_1.z.object({
    entries: zod_1.z.array(TimelineEntrySchema).min(1),
});
const ErdNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
});
const ErdEdgeSchema = zod_1.z.object({
    from: zod_1.z.string(),
    to: zod_1.z.string(),
    label: zod_1.z.string(),
});
const ErdTileContentSchema = zod_1.z.object({
    description: zod_1.z.string(),
    nodes: zod_1.z.array(ErdNodeSchema).min(1),
    edges: zod_1.z.array(ErdEdgeSchema),
});
const ProjectLinkSchema = zod_1.z.object({
    label: zod_1.z.string(),
    url: zod_1.z.string().url(),
});
const ProjectCardContentSchema = zod_1.z.object({
    description: zod_1.z.string(),
    stack: zod_1.z.array(zod_1.z.string()),
    links: zod_1.z.array(ProjectLinkSchema),
    status: zod_1.z.enum(['live', 'in-development']),
});
const ContactLinkSchema = zod_1.z.object({
    platform: zod_1.z.string(),
    url: zod_1.z.string().url(),
    display: zod_1.z.string(),
});
const ContactLinksContentSchema = zod_1.z.object({
    links: zod_1.z.array(ContactLinkSchema).min(1),
});
exports.BentoBlockSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({
        slug: zod_1.z.string(),
        type: zod_1.z.literal('hero'),
        title: zod_1.z.string(),
        order: zod_1.z.number().int().nonnegative(),
        visible: zod_1.z.boolean(),
        content: HeroContentSchema,
    }),
    zod_1.z.object({
        slug: zod_1.z.string(),
        type: zod_1.z.literal('timeline'),
        title: zod_1.z.string(),
        order: zod_1.z.number().int().nonnegative(),
        visible: zod_1.z.boolean(),
        content: TimelineContentSchema,
    }),
    zod_1.z.object({
        slug: zod_1.z.string(),
        type: zod_1.z.literal('erd-tile'),
        title: zod_1.z.string(),
        order: zod_1.z.number().int().nonnegative(),
        visible: zod_1.z.boolean(),
        content: ErdTileContentSchema,
    }),
    zod_1.z.object({
        slug: zod_1.z.string(),
        type: zod_1.z.literal('project-card'),
        title: zod_1.z.string(),
        order: zod_1.z.number().int().nonnegative(),
        visible: zod_1.z.boolean(),
        content: ProjectCardContentSchema,
    }),
    zod_1.z.object({
        slug: zod_1.z.string(),
        type: zod_1.z.literal('contact-links'),
        title: zod_1.z.string(),
        order: zod_1.z.number().int().nonnegative(),
        visible: zod_1.z.boolean(),
        content: ContactLinksContentSchema,
    }),
]);
exports.BentoBlockArraySchema = zod_1.z.array(exports.BentoBlockSchema);
//# sourceMappingURL=schemas.js.map
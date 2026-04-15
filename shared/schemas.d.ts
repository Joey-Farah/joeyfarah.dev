import { z } from 'zod';
export declare const BentoBlockSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"hero">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        lines: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        lines: string[];
    }, {
        lines: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "hero";
    title: string;
    order: number;
    visible: boolean;
    content: {
        lines: string[];
    };
}, {
    slug: string;
    type: "hero";
    title: string;
    order: number;
    visible: boolean;
    content: {
        lines: string[];
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"timeline">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            employer: z.ZodString;
            role: z.ZodString;
            start: z.ZodString;
            end: z.ZodString;
            accomplishments: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }, {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    }, {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "timeline";
    title: string;
    order: number;
    visible: boolean;
    content: {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    };
}, {
    slug: string;
    type: "timeline";
    title: string;
    order: number;
    visible: boolean;
    content: {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"erd-tile">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        description: z.ZodString;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            x: number;
            y: number;
        }, {
            id: string;
            label: string;
            x: number;
            y: number;
        }>, "many">;
        edges: z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            label: string;
            from: string;
            to: string;
        }, {
            label: string;
            from: string;
            to: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    }, {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "erd-tile";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    };
}, {
    slug: string;
    type: "erd-tile";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"project-card">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        description: z.ZodString;
        stack: z.ZodArray<z.ZodString, "many">;
        links: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            label: string;
        }, {
            url: string;
            label: string;
        }>, "many">;
        status: z.ZodEnum<["live", "in-development"]>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    }, {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "project-card";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    };
}, {
    slug: string;
    type: "project-card";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"contact-links">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        links: z.ZodArray<z.ZodObject<{
            platform: z.ZodString;
            url: z.ZodString;
            display: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            platform: string;
            display: string;
        }, {
            url: string;
            platform: string;
            display: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    }, {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "contact-links";
    title: string;
    order: number;
    visible: boolean;
    content: {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    };
}, {
    slug: string;
    type: "contact-links";
    title: string;
    order: number;
    visible: boolean;
    content: {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    };
}>]>;
export declare const BentoBlockArraySchema: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"hero">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        lines: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        lines: string[];
    }, {
        lines: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "hero";
    title: string;
    order: number;
    visible: boolean;
    content: {
        lines: string[];
    };
}, {
    slug: string;
    type: "hero";
    title: string;
    order: number;
    visible: boolean;
    content: {
        lines: string[];
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"timeline">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            employer: z.ZodString;
            role: z.ZodString;
            start: z.ZodString;
            end: z.ZodString;
            accomplishments: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }, {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    }, {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "timeline";
    title: string;
    order: number;
    visible: boolean;
    content: {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    };
}, {
    slug: string;
    type: "timeline";
    title: string;
    order: number;
    visible: boolean;
    content: {
        entries: {
            end: string;
            employer: string;
            role: string;
            start: string;
            accomplishments: string[];
        }[];
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"erd-tile">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        description: z.ZodString;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            x: number;
            y: number;
        }, {
            id: string;
            label: string;
            x: number;
            y: number;
        }>, "many">;
        edges: z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            label: string;
            from: string;
            to: string;
        }, {
            label: string;
            from: string;
            to: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    }, {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "erd-tile";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    };
}, {
    slug: string;
    type: "erd-tile";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        nodes: {
            id: string;
            label: string;
            x: number;
            y: number;
        }[];
        edges: {
            label: string;
            from: string;
            to: string;
        }[];
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"project-card">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        description: z.ZodString;
        stack: z.ZodArray<z.ZodString, "many">;
        links: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            label: string;
        }, {
            url: string;
            label: string;
        }>, "many">;
        status: z.ZodEnum<["live", "in-development"]>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    }, {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "project-card";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    };
}, {
    slug: string;
    type: "project-card";
    title: string;
    order: number;
    visible: boolean;
    content: {
        description: string;
        stack: string[];
        links: {
            url: string;
            label: string;
        }[];
        status: "live" | "in-development";
    };
}>, z.ZodObject<{
    slug: z.ZodString;
    type: z.ZodLiteral<"contact-links">;
    title: z.ZodString;
    order: z.ZodNumber;
    visible: z.ZodBoolean;
    content: z.ZodObject<{
        links: z.ZodArray<z.ZodObject<{
            platform: z.ZodString;
            url: z.ZodString;
            display: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            platform: string;
            display: string;
        }, {
            url: string;
            platform: string;
            display: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    }, {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    type: "contact-links";
    title: string;
    order: number;
    visible: boolean;
    content: {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    };
}, {
    slug: string;
    type: "contact-links";
    title: string;
    order: number;
    visible: boolean;
    content: {
        links: {
            url: string;
            platform: string;
            display: string;
        }[];
    };
}>]>, "many">;
export type BentoBlockSchemaType = z.infer<typeof BentoBlockSchema>;
export type BentoBlockArraySchemaType = z.infer<typeof BentoBlockArraySchema>;
//# sourceMappingURL=schemas.d.ts.map
import mongoose, { Schema } from 'mongoose';
import type { BentoBlock } from 'shared/types';

// Use Mixed for content since BentoBlock content varies by type
const BlockSchema = new Schema<BentoBlock>(
  {
    slug:    { type: String, required: true, unique: true, index: true },
    type:    { type: String, required: true, enum: ['hero', 'timeline', 'erd-tile', 'project-card', 'contact-links'] },
    title:   { type: String, required: true },
    order:   { type: Number, required: true },
    visible: { type: Boolean, required: true },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { versionKey: false }
);

export const BlockModel = mongoose.model<BentoBlock>('Block', BlockSchema);

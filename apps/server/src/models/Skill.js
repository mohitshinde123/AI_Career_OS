import mongoose from 'mongoose';

const skillSourceSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 180 },
  publisher: { type: String, trim: true, maxlength: 120 },
  url: { type: String, trim: true, maxlength: 1000 },
  checkedAt: { type: Date },
}, { _id: false });

const skillSchema = new mongoose.Schema({
  skillId: { type: String, required: true, trim: true, lowercase: true, unique: true, immutable: true },
  normalizedName: { type: String, required: true, trim: true, lowercase: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  aliases: { type: [{ type: String, trim: true, maxlength: 100 }], default: [] },
  category: { type: String, trim: true, maxlength: 80, default: 'general' },
  lifecycle: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', required: true },
  contentVersion: { type: Number, min: 1, default: 1, required: true },
  sourceReferences: { type: [skillSourceSchema], default: [] },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

skillSchema.pre('validate', function enforcePublishedSkillGovernance(next) {
  if (this.lifecycle === 'published' && !this.sourceReferences?.length) {
    return next(new Error('A published skill requires at least one source reference.'));
  }
  return next();
});

skillSchema.index({ lifecycle: 1, category: 1, name: 1 });

export const Skill = mongoose.model('Skill', skillSchema, 'skill_catalog');

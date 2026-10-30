import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  publisher: { type: String, required: true, trim: true, maxlength: 120 },
  url: { type: String, required: true, trim: true, maxlength: 1000 },
  checkedAt: { type: Date, required: true },
  usageNotes: { type: String, trim: true, maxlength: 500, default: '' },
}, { _id: false });

const roleSchema = new mongoose.Schema({
  roleId: { type: String, required: true, trim: true, lowercase: true, unique: true, immutable: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  aliases: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
  industryIds: { type: [{ type: String, trim: true, lowercase: true }], required: true, validate: (items) => Array.isArray(items) && items.length > 0 },
  summary: { type: String, required: true, trim: true, maxlength: 400 },
  lifecycle: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', required: true },
  contentVersion: { type: Number, min: 1, default: 1, required: true },
  publishedPathVersion: { type: Number, min: 1, default: null },
  sourceReferences: { type: [sourceReferenceSchema], default: [] },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

roleSchema.pre('validate', function enforcePublishedRoleGovernance(next) {
  if (this.lifecycle === 'published') {
    if (!this.sourceReferences?.length || !this.reviewedAt || !this.publishedPathVersion) {
      return next(new Error('A published role requires reviewed source references, a review date and a published path version.'));
    }
  }
  return next();
});

roleSchema.index({ lifecycle: 1, industryIds: 1, title: 1 });
roleSchema.index({ title: 'text', aliases: 'text', summary: 'text' });

export const Role = mongoose.model('Role', roleSchema, 'role_catalog');

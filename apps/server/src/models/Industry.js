import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 180 },
  publisher: { type: String, trim: true, maxlength: 120 },
  url: { type: String, trim: true, maxlength: 1000 },
  checkedAt: { type: Date },
  usageNotes: { type: String, trim: true, maxlength: 500 },
}, { _id: false });

const industrySchema = new mongoose.Schema({
  industryId: { type: String, required: true, trim: true, lowercase: true, unique: true, immutable: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  summary: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 1200, default: '' },
  iconKey: { type: String, required: true, enum: ['code', 'database', 'brain', 'shield', 'cloud', 'infinity', 'product', 'design'] },
  sortOrder: { type: Number, required: true, min: 0, default: 0 },
  lifecycle: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', required: true },
  contentVersion: { type: Number, min: 1, default: 1, required: true },
  sourceReferences: { type: [sourceReferenceSchema], default: [] },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

industrySchema.index({ lifecycle: 1, sortOrder: 1, name: 1 });
industrySchema.index({ name: 'text', summary: 'text' });

export const Industry = mongoose.model('Industry', industrySchema, 'industry_catalog');

import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  publisher: { type: String, required: true, trim: true, maxlength: 120 },
  url: { type: String, required: true, trim: true, maxlength: 1000 },
  checkedAt: { type: Date, required: true },
  usageNotes: { type: String, trim: true, maxlength: 500, default: '' },
}, { _id: false });

const industryTrendSnapshotSchema = new mongoose.Schema({
  industryId: { type: String, required: true, trim: true, lowercase: true, index: true },
  trendType: { type: String, enum: ['growth', 'compensation', 'skills'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  summary: { type: String, required: true, trim: true, maxlength: 1000 },
  lifecycle: { type: String, enum: ['draft', 'published', 'expired'], default: 'draft', required: true },
  sourceReferences: { type: [sourceReferenceSchema], required: true, validate: (items) => Array.isArray(items) && items.length > 0 },
  checkedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

industryTrendSnapshotSchema.index({ industryId: 1, lifecycle: 1, expiresAt: -1 });

export const IndustryTrendSnapshot = mongoose.model('IndustryTrendSnapshot', industryTrendSnapshotSchema, 'industry_trend_snapshots');

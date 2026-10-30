import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  publisher: { type: String, required: true, trim: true, maxlength: 120 },
  url: { type: String, required: true, trim: true, maxlength: 1000 },
  checkedAt: { type: Date, required: true },
}, { _id: false });

const rolePathVersionSchema = new mongoose.Schema({
  roleId: { type: String, required: true, trim: true, lowercase: true, index: true },
  version: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', required: true },
  entryProfile: { type: String, trim: true, maxlength: 1200, default: '' },
  targetOutcomes: { type: [{ type: String, trim: true, maxlength: 240 }], default: [] },
  sourceReferences: { type: [sourceReferenceSchema], default: [] },
  reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
  reviewedAt: { type: Date, default: null },
  publishedAt: { type: Date, default: null },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

rolePathVersionSchema.pre('validate', function enforcePublishedPathGovernance(next) {
  if (this.status === 'published') {
    if (this.reviewStatus !== 'approved' || !this.reviewedAt || !this.publishedAt || !this.sourceReferences?.length) {
      return next(new Error('A published role path requires approved review, publication dates and source references.'));
    }
  }
  return next();
});

rolePathVersionSchema.index({ roleId: 1, version: 1 }, { unique: true });
rolePathVersionSchema.index({ roleId: 1, status: 1, version: -1 });

export const RolePathVersion = mongoose.model('RolePathVersion', rolePathVersionSchema, 'role_path_versions');

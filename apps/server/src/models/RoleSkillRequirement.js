import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  publisher: { type: String, required: true, trim: true, maxlength: 120 },
  url: { type: String, required: true, trim: true, maxlength: 1000 },
  checkedAt: { type: Date, required: true },
}, { _id: false });

const roleSkillRequirementSchema = new mongoose.Schema({
  roleId: { type: String, required: true, trim: true, lowercase: true },
  rolePathVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'RolePathVersion', required: true },
  skillId: { type: String, required: true, trim: true, lowercase: true },
  requirementType: { type: String, enum: ['core', 'important', 'optional'], required: true },
  priority: { type: Number, min: 1, max: 5, required: true },
  evidenceExpectation: { type: String, required: true, trim: true, maxlength: 600 },
  sourceReferences: { type: [sourceReferenceSchema], default: [] },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

roleSkillRequirementSchema.pre('validate', function requireReviewedEvidenceSource(next) {
  if (!this.sourceReferences?.length) {
    return next(new Error('A role-skill requirement requires a source reference.'));
  }
  return next();
});

roleSkillRequirementSchema.index({ rolePathVersionId: 1, skillId: 1 }, { unique: true });
roleSkillRequirementSchema.index({ roleId: 1, rolePathVersionId: 1, priority: 1 });

export const RoleSkillRequirement = mongoose.model('RoleSkillRequirement', roleSkillRequirementSchema, 'role_skill_requirements');

import mongoose from 'mongoose';

const careerGoalSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clerkUserId: { type: String, required: true },
  industryId: { type: String, required: true, trim: true, lowercase: true },
  roleId: { type: String, required: true, trim: true, lowercase: true },
  rolePathVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'RolePathVersion', required: true },
  goalType: { type: String, enum: ['senior_growth', 'next_opportunity', 'career_direction'], required: true },
  targetTimeline: { type: String, trim: true, maxlength: 80, default: '' },
  status: { type: String, enum: ['active', 'superseded', 'paused', 'completed'], default: 'active', required: true },
  selectionSource: { type: String, enum: ['career_selection', 'career_directory', 'onboarding'], required: true },
  confirmedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true, strict: 'throw', versionKey: 'recordVersion' });

careerGoalSchema.index({ ownerUserId: 1, status: 1, updatedAt: -1 });
careerGoalSchema.index({ ownerUserId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

export const CareerGoal = mongoose.model('CareerGoal', careerGoalSchema, 'career_goals');

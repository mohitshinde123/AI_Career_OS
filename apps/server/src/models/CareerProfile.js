import mongoose from 'mongoose';
import {
  CURRENT_STATUS_VALUES, EDUCATION_VALUES, EXPERIENCE_VALUES,
  CAREER_GOAL_VALUES, WORK_PREFERENCE_VALUES,
} from '@talentbridge/contracts';

const careerProfileSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clerkUserId: { type: String, required: true },
  preferredName: { type: String, trim: true, maxlength: 80, default: '' },
  currentStatus: { type: String, enum: CURRENT_STATUS_VALUES },
  highestEducation: { type: String, enum: EDUCATION_VALUES },
  experienceLevel: { type: String, enum: EXPERIENCE_VALUES },
  location: { type: String, trim: true, maxlength: 120, default: '' },
  targetInterest: { type: String, trim: true, maxlength: 300, default: '' },
  constraints: { type: String, trim: true, maxlength: 1000, default: '' },
  weeklyAvailabilityHours: { type: Number, min: 0, max: 168 },
  careerPreferences: { type: String, trim: true, maxlength: 500, default: '' },
  mainGoal: { type: String, enum: CAREER_GOAL_VALUES, default: undefined },
  targetRole: { type: String, trim: true, maxlength: 120, default: '' },
  selectedIndustryId: { type: String, trim: true, lowercase: true, default: '' },
  selectedRoleId: { type: String, trim: true, lowercase: true, default: '' },
  selectedRolePathVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'RolePathVersion', default: null },
  targetTimeline: { type: String, trim: true, maxlength: 80, default: '' },
  workPreferences: { type: [{ type: String, enum: WORK_PREFERENCE_VALUES }], default: [] },
  strengths: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
  strengthsNotes: { type: String, trim: true, maxlength: 800, default: '' },
  onboardingStep: { type: Number, min: 1, max: 4, default: 1 },
  profilePersonalizationConsent: { type: Boolean, required: true, default: false },
  onboardingCompletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  strict: 'throw',
  versionKey: 'recordVersion',
});

careerProfileSchema.index({ ownerUserId: 1 }, { unique: true });
careerProfileSchema.index({ clerkUserId: 1 }, { unique: true });

export const CareerProfile = mongoose.model('CareerProfile', careerProfileSchema);
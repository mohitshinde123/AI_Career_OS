import mongoose from 'mongoose';
import { CURRENT_STATUS_VALUES, EDUCATION_VALUES, EXPERIENCE_VALUES } from '@talentbridge/contracts';

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
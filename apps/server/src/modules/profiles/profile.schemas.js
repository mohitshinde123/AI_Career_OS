import { z } from 'zod';
import { CURRENT_STATUS_VALUES, EDUCATION_VALUES, EXPERIENCE_VALUES } from '@talentbridge/contracts';

export const currentStatusValues = CURRENT_STATUS_VALUES;
export const educationValues = EDUCATION_VALUES;
export const experienceValues = EXPERIENCE_VALUES;

const preferredName = z.string().trim().max(80).optional().default('');
const location = z.string().trim().max(120).optional().default('');
const targetInterest = z.string().trim().max(300).optional().default('');
const constraints = z.string().trim().max(1000).optional().default('');
const careerPreferences = z.string().trim().max(500).optional().default('');
const weeklyAvailabilityHours = z.preprocess(
  (value) => value === '' || value === null || value === undefined ? undefined : Number(value),
  z.number().int().min(0).max(168).optional(),
);
const currentStatus = z.enum(currentStatusValues);
const highestEducation = z.enum(educationValues);
const experienceLevel = z.enum(experienceValues);

export const onboardingSchema = z.object({
  preferredName,
  location,
  targetInterest,
  constraints,
  weeklyAvailabilityHours,
  careerPreferences,
  profilePersonalizationConsent: z.boolean().optional().default(false),
  currentStatus,
  highestEducation,
  experienceLevel,
}).strict();

export const profileUpdateSchema = z.object({
  preferredName: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  targetInterest: z.string().trim().max(300).optional(),
  constraints: z.string().trim().max(1000).optional(),
  weeklyAvailabilityHours,
  careerPreferences: z.string().trim().max(500).optional(),
  profilePersonalizationConsent: z.boolean().optional(),
  currentStatus: currentStatus.optional(),
  highestEducation: highestEducation.optional(),
  experienceLevel: experienceLevel.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Provide at least one supported profile field to update.',
});

export function toPublicProfile(profile) {
  if (!profile) return null;
  return {
    preferredName: profile.preferredName || '',
    currentStatus: profile.currentStatus || '',
    highestEducation: profile.highestEducation || '',
    experienceLevel: profile.experienceLevel || '',
    location: profile.location || '',
    targetInterest: profile.targetInterest || '',
    constraints: profile.constraints || '',
    weeklyAvailabilityHours: profile.weeklyAvailabilityHours ?? null,
    careerPreferences: profile.careerPreferences || '',
    profilePersonalizationConsent: Boolean(profile.profilePersonalizationConsent),
    onboardingCompletedAt: profile.onboardingCompletedAt || null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

import { z } from 'zod';
import {
  CURRENT_STATUS_VALUES, EDUCATION_VALUES, EXPERIENCE_VALUES,
  CAREER_GOAL_VALUES, WORK_PREFERENCE_VALUES,
} from '@talentbridge/contracts';

export const currentStatusValues = CURRENT_STATUS_VALUES;
export const educationValues = EDUCATION_VALUES;
export const experienceValues = EXPERIENCE_VALUES;

const preferredName = z.string().trim().max(80).optional().default('');
const location = z.string().trim().max(120).optional().default('');
const targetInterest = z.string().trim().max(300).optional().default('');
const constraints = z.string().trim().max(1000).optional().default('');
const careerPreferences = z.string().trim().max(500).optional().default('');
const targetRole = z.string().trim().max(120).optional().default('');
const targetTimeline = z.string().trim().max(80).optional().default('');
const strengthsNotes = z.string().trim().max(800).optional().default('');
const mainGoal = z.preprocess((value) => value === '' ? undefined : value, z.enum(CAREER_GOAL_VALUES).optional());
const workPreferences = z.array(z.enum(WORK_PREFERENCE_VALUES)).max(4).optional().default([]);
const strengths = z.array(z.string().trim().min(1).max(60)).max(30).optional().default([]).refine(
  (items) => new Set(items.map((item) => item.toLowerCase())).size === items.length,
  { message: 'Strengths must not contain duplicates.' },
);
const onboardingStep = z.number().int().min(1).max(4).optional();
const weeklyAvailabilityHours = z.preprocess(
  (value) => value === '' || value === null || value === undefined ? undefined : Number(value),
  z.number().int().min(0).max(168).optional(),
);
const currentStatus = z.enum(currentStatusValues);
const highestEducation = z.enum(educationValues);
const experienceLevel = z.enum(experienceValues);
const optionalCurrentStatus = z.preprocess((value) => value === '' ? undefined : value, currentStatus.optional());
const optionalHighestEducation = z.preprocess((value) => value === '' ? undefined : value, highestEducation.optional());
const optionalExperienceLevel = z.preprocess((value) => value === '' ? undefined : value, experienceLevel.optional());

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
  mainGoal: z.enum(CAREER_GOAL_VALUES),
  targetRole: z.string().trim().min(1).max(120),
  targetTimeline,
  workPreferences,
  strengths,
  strengthsNotes,
  onboardingStep: onboardingStep.optional().default(4),
}).strict();

export const profileUpdateSchema = z.object({
  preferredName: z.string().trim().max(80).optional(),
  location: z.string().trim().max(120).optional(),
  targetInterest: z.string().trim().max(300).optional(),
  constraints: z.string().trim().max(1000).optional(),
  weeklyAvailabilityHours,
  careerPreferences: z.string().trim().max(500).optional(),
  profilePersonalizationConsent: z.boolean().optional(),
  currentStatus: optionalCurrentStatus,
  highestEducation: optionalHighestEducation,
  experienceLevel: optionalExperienceLevel,
  mainGoal,
  targetRole: z.string().trim().max(120).optional(),
  targetTimeline: z.string().trim().max(80).optional(),
  workPreferences: z.array(z.enum(WORK_PREFERENCE_VALUES)).max(4).optional(),
  strengths: z.array(z.string().trim().min(1).max(60)).max(30).optional().refine(
    (items) => items === undefined || new Set(items.map((item) => item.toLowerCase())).size === items.length,
    { message: 'Strengths must not contain duplicates.' },
  ),
  strengthsNotes: z.string().trim().max(800).optional(),
  onboardingStep,
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
    mainGoal: profile.mainGoal || '',
    targetRole: profile.targetRole || '',
    selectedIndustryId: profile.selectedIndustryId || '',
    selectedRoleId: profile.selectedRoleId || '',
    selectedRolePathVersionId: profile.selectedRolePathVersionId ? String(profile.selectedRolePathVersionId) : '',
    targetTimeline: profile.targetTimeline || '',
    workPreferences: Array.isArray(profile.workPreferences) ? profile.workPreferences : [],
    strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
    strengthsNotes: profile.strengthsNotes || '',
    onboardingStep: profile.onboardingStep || 1,
    onboardingCompletedAt: profile.onboardingCompletedAt || null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

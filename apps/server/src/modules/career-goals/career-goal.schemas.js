import { z } from 'zod';
import { WORK_PREFERENCE_VALUES } from '@talentbridge/contracts';

export const careerGoalSelectionSchema = z.object({
  industryId: z.string().trim().toLowerCase().min(1).max(100).regex(/^[a-z0-9][a-z0-9-]*$/),
  roleId: z.string().trim().toLowerCase().min(1).max(100).regex(/^[a-z0-9][a-z0-9-]*$/),
  rolePathVersionId: z.string().trim().regex(/^[a-f\d]{24}$/i),
  goalType: z.enum(['senior_growth', 'next_opportunity', 'career_direction']),
  targetTimeline: z.string().trim().max(80).optional().default(''),
  selectionSource: z.enum(['career_selection', 'career_directory', 'onboarding']).optional().default('career_selection'),
  workPreferences: z.array(z.enum(WORK_PREFERENCE_VALUES)).max(4).optional(),
}).strict();

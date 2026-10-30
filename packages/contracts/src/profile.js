export const CURRENT_STATUS_OPTIONS = [
  ['student', 'Student'],
  ['recent_graduate', 'Recent graduate'],
  ['employed', 'Currently employed'],
  ['career_switcher', 'Changing careers'],
  ['other', 'Other'],
];

export const EDUCATION_OPTIONS = [
  ['high_school', 'High school'],
  ['diploma', 'Diploma'],
  ['bachelor', "Bachelor's degree"],
  ['master', "Master's degree"],
  ['doctorate', 'Doctorate'],
  ['other', 'Other'],
  ['prefer_not_to_say', 'Prefer not to say'],
];

export const EXPERIENCE_OPTIONS = [
  ['none', 'No professional experience yet'],
  ['under_1_year', 'Less than 1 year'],
  ['1_to_3_years', '1–3 years'],
  ['3_to_5_years', '3–5 years'],
  ['5_plus_years', '5+ years'],
  ['prefer_not_to_say', 'Prefer not to say'],
];

export const CURRENT_STATUS_VALUES = CURRENT_STATUS_OPTIONS.map(([value]) => value);
export const EDUCATION_VALUES = EDUCATION_OPTIONS.map(([value]) => value);
export const EXPERIENCE_VALUES = EXPERIENCE_OPTIONS.map(([value]) => value);

export const PROFILE_VALUE_LABELS = Object.fromEntries([
  ...CURRENT_STATUS_OPTIONS,
  ...EDUCATION_OPTIONS,
  ...EXPERIENCE_OPTIONS,
]);

// Phase 1 onboarding choices shared by the client and server.
export const CAREER_GOAL_OPTIONS = [
  ['senior_growth', 'Grow into a more senior role'],
  ['next_opportunity', 'Find my next opportunity'],
  ['career_direction', 'Explore a new career direction'],
];

export const WORK_PREFERENCE_OPTIONS = [
  ['Remote', 'Remote'],
  ['Hybrid', 'Hybrid'],
  ['On-site', 'On-site'],
  ['Open to anything', 'Open to anything'],
];

export const CAREER_GOAL_VALUES = CAREER_GOAL_OPTIONS.map(([value]) => value);
export const WORK_PREFERENCE_VALUES = WORK_PREFERENCE_OPTIONS.map(([value]) => value);

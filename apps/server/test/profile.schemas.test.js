import test from 'node:test';
import assert from 'node:assert/strict';
import { onboardingSchema, profileUpdateSchema, toPublicProfile } from '../src/modules/profiles/profile.schemas.js';

const validOnboarding = {
  preferredName: 'Sam',
  location: '',
  targetInterest: 'Software development',
  constraints: '',
  weeklyAvailabilityHours: 8,
  careerPreferences: 'Self-paced learning',
  mainGoal: 'senior_growth',
  targetRole: 'Software Developer',
  profilePersonalizationConsent: true,
  currentStatus: 'recent_graduate',
  highestEducation: 'master',
  experienceLevel: 'none',
};

test('onboarding accepts supported baseline and career-context fields', () => {
  const result = onboardingSchema.parse(validOnboarding);
  assert.equal(result.currentStatus, 'recent_graduate');
  assert.equal(result.experienceLevel, 'none');
  assert.equal(result.weeklyAvailabilityHours, 8);
  assert.equal(result.profilePersonalizationConsent, true);
});

test('onboarding allows declining optional personalization', () => {
  const result = onboardingSchema.parse({ ...validOnboarding, profilePersonalizationConsent: false });
  assert.equal(result.profilePersonalizationConsent, false);
  assert.equal(onboardingSchema.parse({ ...validOnboarding, profilePersonalizationConsent: undefined }).profilePersonalizationConsent, false);
});

test('onboarding rejects unsupported or client-injected fields', () => {
  assert.throws(() => onboardingSchema.parse({ ...validOnboarding, isAdmin: true }));
  assert.throws(() => onboardingSchema.parse({ ...validOnboarding, mainGoal: '' }));
  assert.throws(() => onboardingSchema.parse({ ...validOnboarding, currentStatus: 'invented_value' }));
  assert.throws(() => onboardingSchema.parse({ ...validOnboarding, weeklyAvailabilityHours: 169 }));
});

test('profile update rejects an empty update and unknown fields', () => {
  assert.throws(() => profileUpdateSchema.parse({}));
  assert.throws(() => profileUpdateSchema.parse({ preferredName: 'Taylor', accountStatus: 'disabled' }));
  assert.equal(profileUpdateSchema.parse({ profilePersonalizationConsent: false }).profilePersonalizationConsent, false);
});

test('public profile does not expose internal owner identifiers', () => {
  const result = toPublicProfile({
    ownerUserId: 'internal-id', clerkUserId: 'clerk-id', preferredName: 'Lee',
    currentStatus: 'student', highestEducation: 'bachelor', experienceLevel: 'none',
    location: '', targetInterest: '', constraints: '', weeklyAvailabilityHours: null,
    careerPreferences: '', profilePersonalizationConsent: true, onboardingCompletedAt: null,
  });
  assert.equal(result.preferredName, 'Lee');
  assert.equal('ownerUserId' in result, false);
  assert.equal('clerkUserId' in result, false);
});


test('onboarding accepts the four-step direction and self-reported strengths fields', () => {
  const result = onboardingSchema.parse({
    ...validOnboarding,
    mainGoal: 'senior_growth',
    targetRole: 'Senior Product Designer',
    targetTimeline: 'In the next 3–6 months',
    workPreferences: ['Remote', 'Hybrid'],
    strengths: ['Product thinking', 'User research'],
    strengthsNotes: 'Coursework and independent projects.',
    onboardingStep: 4,
  });
  assert.equal(result.mainGoal, 'senior_growth');
  assert.equal(result.targetRole, 'Senior Product Designer');
  assert.deepEqual(result.workPreferences, ['Remote', 'Hybrid']);
  assert.deepEqual(result.strengths, ['Product thinking', 'User research']);
  assert.equal(result.onboardingStep, 4);
});

test('profile draft updates accept onboarding progress and reject invalid strength values', () => {
  const result = profileUpdateSchema.parse({
    mainGoal: 'next_opportunity',
    targetRole: 'Software Engineer',
    workPreferences: ['Remote'],
    strengths: ['Python'],
    onboardingStep: 2,
  });
  assert.equal(result.onboardingStep, 2);
  const partial = profileUpdateSchema.parse({ mainGoal: '', currentStatus: '', highestEducation: '', experienceLevel: '' });
  assert.equal(partial.mainGoal, undefined);
  assert.equal(partial.currentStatus, undefined);
  assert.throws(() => profileUpdateSchema.parse({ strengths: [''] }));
  assert.throws(() => profileUpdateSchema.parse({ onboardingStep: 5 }));
});

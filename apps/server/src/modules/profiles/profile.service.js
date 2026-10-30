import { CareerProfile } from '../../models/CareerProfile.js';
import { toPublicProfile } from './profile.schemas.js';

export async function getProfileForUser(user) {
  const profile = await CareerProfile.findOne({ ownerUserId: user._id, clerkUserId: user.clerkUserId }).lean();
  return toPublicProfile(profile);
}

export async function upsertOnboardingForUser(user, validatedData) {
  const profile = await CareerProfile.findOneAndUpdate(
    { ownerUserId: user._id, clerkUserId: user.clerkUserId },
    { $set: { ...validatedData, ownerUserId: user._id, clerkUserId: user.clerkUserId, onboardingCompletedAt: new Date() } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return toPublicProfile(profile);
}

export async function updateProfileForUser(user, validatedData) {
  const profile = await CareerProfile.findOneAndUpdate(
    { ownerUserId: user._id, clerkUserId: user.clerkUserId },
    { $set: validatedData, $setOnInsert: { ownerUserId: user._id, clerkUserId: user.clerkUserId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return toPublicProfile(profile);
}
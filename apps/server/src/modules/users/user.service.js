import { User } from '../../models/User.js';

export async function findOrCreateUser(clerkUserId) {
  try {
    return await User.findOneAndUpdate(
      { clerkUserId },
      { $setOnInsert: { clerkUserId, accountStatus: 'active' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    // Two concurrent first requests can race against the unique index.
    if (error?.code === 11000) {
      const existing = await User.findOne({ clerkUserId });
      if (existing) return existing;
    }
    throw error;
  }
}
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true, immutable: true },
  accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active', required: true },
}, {
  timestamps: true,
  strict: 'throw',
  versionKey: 'recordVersion',
});

export const User = mongoose.model('User', userSchema);
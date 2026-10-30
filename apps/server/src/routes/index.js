import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.js';
import { CareerProfile } from '../models/CareerProfile.js';
import { onboardingSchema, profileUpdateSchema, toPublicProfile } from '../modules/profiles/profile.schemas.js';
import { getProfileForUser, upsertOnboardingForUser, updateProfileForUser } from '../modules/profiles/profile.service.js';
import { databaseIsReady } from '../config/database.js';

export const apiRouter = Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const ok = (data) => ({ data });

apiRouter.get('/health/live', (_req, res) => res.status(200).json(ok({ status: 'ok' })));
apiRouter.get('/health/ready', (_req, res) => {
  const ready = databaseIsReady();
  return res.status(ready ? 200 : 503).json(ok({ status: ready ? 'ready' : 'not_ready', dependencies: { database: ready ? 'connected' : 'unavailable' } }));
});

apiRouter.get('/me', requireAuth, asyncRoute(async (req, res) => {
  const profileDoc = await CareerProfile.findOne({ ownerUserId: req.talentBridgeUser._id, clerkUserId: req.talentBridgeUser.clerkUserId }).lean();
  res.json(ok({
    user: { id: String(req.talentBridgeUser._id), status: req.talentBridgeUser.accountStatus, createdAt: req.talentBridgeUser.createdAt },
    profile: toPublicProfile(profileDoc),
    onboardingCompleted: Boolean(profileDoc?.onboardingCompletedAt),
  }));
}));

apiRouter.get('/profile', requireAuth, asyncRoute(async (req, res) => {
  const profile = await getProfileForUser(req.talentBridgeUser);
  res.json(ok({ profile, onboardingCompleted: Boolean(profile?.onboardingCompletedAt) }));
}));

apiRouter.put('/profile', requireAuth, asyncRoute(async (req, res) => {
  const validated = profileUpdateSchema.parse(req.body);
  const profile = await updateProfileForUser(req.talentBridgeUser, validated);
  res.json(ok({ profile, onboardingCompleted: Boolean(profile?.onboardingCompletedAt) }));
}));

apiRouter.put('/onboarding', requireAuth, asyncRoute(async (req, res) => {
  const validated = onboardingSchema.parse(req.body);
  const profile = await upsertOnboardingForUser(req.talentBridgeUser, validated);
  res.json(ok({ profile, onboardingCompleted: Boolean(profile?.onboardingCompletedAt) }));
}));

import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.js';
import { CareerProfile } from '../models/CareerProfile.js';
import { onboardingSchema, profileUpdateSchema, toPublicProfile } from '../modules/profiles/profile.schemas.js';
import { getProfileForUser, upsertOnboardingForUser, updateProfileForUser } from '../modules/profiles/profile.service.js';
import { databaseIsReady } from '../config/database.js';
import { industryIdSchema, industryListQuerySchema, industryTrendQuerySchema } from '../modules/industries/industry.schemas.js';
import { getPublishedIndustry, listPublishedIndustries, listReviewedIndustryTrends } from '../modules/industries/industry.service.js';
import { roleIdSchema, roleListQuerySchema } from '../modules/roles/role.schemas.js';
import { getPublishedRole, getPublishedRolePath, listPublishedRoles } from '../modules/roles/role.service.js';
import { careerGoalSelectionSchema } from '../modules/career-goals/career-goal.schemas.js';
import { getCurrentCareerGoal, saveCareerGoal } from '../modules/career-goals/career-goal.service.js';

export const apiRouter = Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const ok = (data) => ({ data });

apiRouter.get('/health/live', (_req, res) => res.status(200).json(ok({ status: 'ok' })));
apiRouter.get('/health/ready', (_req, res) => {
  const ready = databaseIsReady();
  return res.status(ready ? 200 : 503).json(ok({ status: ready ? 'ready' : 'not_ready', dependencies: { database: ready ? 'connected' : 'unavailable' } }));
});

// Phase 1 account and profile endpoints.
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

// Phase 2: published industry catalogue.
apiRouter.get('/industries', requireAuth, asyncRoute(async (req, res) => {
  const query = industryListQuerySchema.parse(req.query);
  const result = await listPublishedIndustries(query);
  res.json(ok(result));
}));

apiRouter.get('/industry-trends', requireAuth, asyncRoute(async (req, res) => {
  const query = industryTrendQuerySchema.parse(req.query);
  const items = await listReviewedIndustryTrends(query);
  res.json(ok({ items }));
}));

apiRouter.get('/industries/:industryId', requireAuth, asyncRoute(async (req, res) => {
  const industryId = industryIdSchema.parse(req.params.industryId);
  const industry = await getPublishedIndustry(industryId);
  if (!industry) return res.status(404).json({ error: { code: 'INDUSTRY_NOT_FOUND', message: 'This industry is not currently available.', requestId: req.requestId } });
  res.json(ok({ industry }));
}));

apiRouter.get('/industries/:industryId/roles', requireAuth, asyncRoute(async (req, res) => {
  const industryId = industryIdSchema.parse(req.params.industryId);
  const query = roleListQuerySchema.parse({ ...req.query, industryId });
  const result = await listPublishedRoles(query);
  res.json(ok(result));
}));

// Phase 2: published role marketplace. Draft and unreviewed records are never returned.
apiRouter.get('/roles', requireAuth, asyncRoute(async (req, res) => {
  const query = roleListQuerySchema.parse(req.query);
  const result = await listPublishedRoles(query);
  res.json(ok(result));
}));

apiRouter.get('/roles/:roleId', requireAuth, asyncRoute(async (req, res) => {
  const roleId = roleIdSchema.parse(req.params.roleId);
  const role = await getPublishedRole(roleId);
  if (!role) return res.status(404).json({ error: { code: 'ROLE_NOT_FOUND', message: 'This role is not currently available.', requestId: req.requestId } });
  res.json(ok({ role }));
}));

apiRouter.get('/roles/:roleId/path', requireAuth, asyncRoute(async (req, res) => {
  const roleId = roleIdSchema.parse(req.params.roleId);
  const path = await getPublishedRolePath(roleId);
  if (!path) return res.status(404).json({ error: { code: 'ROLE_PATH_NOT_FOUND', message: 'A reviewed career path is not available for this role yet.', requestId: req.requestId } });
  res.json(ok({ path }));
}));

// Phase 2: persisted canonical career selection, with history retained.
apiRouter.get('/career-goals/current', requireAuth, asyncRoute(async (req, res) => {
  const result = await getCurrentCareerGoal(req.talentBridgeUser);
  res.json(ok(result));
}));

apiRouter.put('/career-goals/current', requireAuth, asyncRoute(async (req, res) => {
  const validated = careerGoalSelectionSchema.parse(req.body);
  const goal = await saveCareerGoal(req.talentBridgeUser, validated);
  res.json(ok({ goal }));
}));

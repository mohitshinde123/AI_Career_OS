import { CareerGoal } from '../../models/CareerGoal.js';
import { CareerProfile } from '../../models/CareerProfile.js';
import { Industry } from '../../models/Industry.js';
import { Role } from '../../models/Role.js';
import { RolePathVersion } from '../../models/RolePathVersion.js';

export class CareerGoalError extends Error {
  constructor(message, statusCode = 400, code = 'CAREER_GOAL_INVALID') {
    super(message);
    this.name = 'CareerGoalError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function publicGoal(goal) {
  if (!goal) return null;
  return {
    id: String(goal._id),
    industryId: goal.industryId,
    roleId: goal.roleId,
    rolePathVersionId: String(goal.rolePathVersionId),
    goalType: goal.goalType,
    targetTimeline: goal.targetTimeline || '',
    status: goal.status,
    selectionSource: goal.selectionSource,
    confirmedAt: goal.confirmedAt,
    createdAt: goal.createdAt,
  };
}

export async function getCurrentCareerGoal(user) {
  const goal = await CareerGoal.findOne({ ownerUserId: user._id, clerkUserId: user.clerkUserId, status: 'active' }).lean();
  if (!goal) return { goal: null };
  const [industry, role] = await Promise.all([
    Industry.findOne({ industryId: goal.industryId, lifecycle: 'published' }).select('industryId name').lean(),
    Role.findOne({ roleId: goal.roleId, lifecycle: 'published' }).select('roleId title').lean(),
  ]);
  return {
    goal: publicGoal(goal),
    industry: industry ? { industryId: industry.industryId, name: industry.name } : null,
    role: role ? { roleId: role.roleId, title: role.title } : null,
  };
}

export async function saveCareerGoal(user, input) {
  const [industry, role, path] = await Promise.all([
    Industry.findOne({ industryId: input.industryId, lifecycle: 'published' }).lean(),
    Role.findOne({ roleId: input.roleId, lifecycle: 'published' }).lean(),
    RolePathVersion.findById(input.rolePathVersionId).lean(),
  ]);

  if (!industry || !role || !path) {
    throw new CareerGoalError('This industry, role or career path is no longer available. Refresh the catalogue and try again.', 409, 'CATALOG_SELECTION_STALE');
  }
  if (!role.industryIds.includes(industry.industryId)) {
    throw new CareerGoalError('The selected role does not belong to the selected industry.', 400, 'ROLE_INDUSTRY_MISMATCH');
  }
  if (path.roleId !== role.roleId || path.status !== 'published' || path.reviewStatus !== 'approved' || path.version !== role.publishedPathVersion) {
    throw new CareerGoalError('This role does not have a current reviewed career path available for selection.', 409, 'ROLE_PATH_UNAVAILABLE');
  }

  const previous = await CareerGoal.findOne({ ownerUserId: user._id, clerkUserId: user.clerkUserId, status: 'active' });
  if (previous
    && previous.industryId === industry.industryId
    && previous.roleId === role.roleId
    && String(previous.rolePathVersionId) === String(path._id)
    && previous.goalType === input.goalType
    && previous.targetTimeline === input.targetTimeline) {
    if (input.workPreferences) {
      await CareerProfile.findOneAndUpdate(
        { ownerUserId: user._id, clerkUserId: user.clerkUserId },
        { $set: { workPreferences: input.workPreferences } },
        { runValidators: true, returnDocument: 'after' },
      );
    }
    return publicGoal(previous);
  }

  let createdGoal;
  try {
    if (previous) {
      previous.status = 'superseded';
      await previous.save();
    }
    createdGoal = await CareerGoal.create({
      ownerUserId: user._id,
      clerkUserId: user.clerkUserId,
      industryId: industry.industryId,
      roleId: role.roleId,
      rolePathVersionId: path._id,
      goalType: input.goalType,
      targetTimeline: input.targetTimeline,
      status: 'active',
      selectionSource: input.selectionSource,
      confirmedAt: new Date(),
    });
    await CareerProfile.findOneAndUpdate(
      { ownerUserId: user._id, clerkUserId: user.clerkUserId },
      {
        $set: {
          ownerUserId: user._id,
          clerkUserId: user.clerkUserId,
          selectedIndustryId: industry.industryId,
          selectedRoleId: role.roleId,
          selectedRolePathVersionId: path._id,
          mainGoal: input.goalType,
          targetRole: role.title,
          targetTimeline: input.targetTimeline,
          ...(input.workPreferences ? { workPreferences: input.workPreferences } : {}),
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true, returnDocument: 'after' },
    );
    return publicGoal(createdGoal);
  } catch (error) {
    if (createdGoal?._id) await CareerGoal.deleteOne({ _id: createdGoal._id }).catch(() => undefined);
    if (previous) {
      previous.status = 'active';
      await previous.save().catch(() => undefined);
    }
    if (error?.code === 11000) {
      throw new CareerGoalError('Your career selection changed in another request. Refresh and try again.', 409, 'CAREER_GOAL_CONFLICT');
    }
    throw error;
  }
}

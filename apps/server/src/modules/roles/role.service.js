import { Industry } from '../../models/Industry.js';
import { Role } from '../../models/Role.js';
import { RolePathVersion } from '../../models/RolePathVersion.js';
import { RoleSkillRequirement } from '../../models/RoleSkillRequirement.js';
import { Skill } from '../../models/Skill.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function attachIndustryNames(roles) {
  const industryIds = [...new Set(roles.flatMap((role) => role.industryIds || []))];
  const industries = industryIds.length
    ? await Industry.find({ industryId: { $in: industryIds }, lifecycle: 'published' }).select('industryId name').lean()
    : [];
  const names = new Map(industries.map((industry) => [industry.industryId, industry.name]));
  return roles.map((role) => ({
    roleId: role.roleId,
    slug: role.slug,
    title: role.title,
    aliases: role.aliases || [],
    industryIds: role.industryIds || [],
    industries: (role.industryIds || []).map((id) => ({ industryId: id, name: names.get(id) })).filter((item) => item.name),
    summary: role.summary,
    contentVersion: role.contentVersion,
    publishedPathVersion: role.publishedPathVersion,
  }));
}

export async function listPublishedRoles({ q = '', industryId, page = 1, limit = 12 }) {
  const activeIndustryIds = await Industry.distinct('industryId', { lifecycle: 'published' });
  const filter = { lifecycle: 'published', publishedPathVersion: { $ne: null }, industryIds: { $in: activeIndustryIds } };
  if (industryId) {
    if (!activeIndustryIds.includes(industryId)) {
      return { items: [], pagination: { page, limit, total: 0, pageCount: 0 } };
    }
    filter.industryIds = industryId;
  }
  if (q) {
    const search = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: search }, { aliases: search }, { summary: search }];
  }
  const skip = (page - 1) * limit;
  const [roles, total] = await Promise.all([
    Role.find(filter).sort({ title: 1 }).skip(skip).limit(limit).lean(),
    Role.countDocuments(filter),
  ]);
  return {
    items: await attachIndustryNames(roles),
    pagination: { page, limit, total, pageCount: Math.ceil(total / limit) },
  };
}

export async function getPublishedRole(roleId) {
  const role = await Role.findOne({ roleId, lifecycle: 'published', publishedPathVersion: { $ne: null } }).lean();
  if (!role) return null;
  const [item] = await attachIndustryNames([role]);
  return item.industries.length ? item : null;
}

export async function getPublishedRolePath(roleId) {
  const role = await Role.findOne({ roleId, lifecycle: 'published', publishedPathVersion: { $ne: null } }).lean();
  if (!role) return null;
  const path = await RolePathVersion.findOne({
    roleId,
    version: role.publishedPathVersion,
    status: 'published',
    reviewStatus: 'approved',
  }).lean();
  if (!path) return null;
  const requirements = await RoleSkillRequirement.find({ rolePathVersionId: path._id }).sort({ priority: 1 }).lean();
  const skillIds = requirements.map((item) => item.skillId);
  const skills = skillIds.length
    ? await Skill.find({ skillId: { $in: skillIds }, lifecycle: 'published' }).select('skillId name category').lean()
    : [];
  const skillMap = new Map(skills.map((skill) => [skill.skillId, skill]));
  return {
    roleId,
    rolePathVersionId: String(path._id),
    version: path.version,
    entryProfile: path.entryProfile,
    targetOutcomes: path.targetOutcomes,
    skills: requirements.map((requirement) => ({
      skill: skillMap.get(requirement.skillId) || null,
      requirementType: requirement.requirementType,
      priority: requirement.priority,
      evidenceExpectation: requirement.evidenceExpectation,
    })).filter((item) => item.skill),
    reviewedAt: path.reviewedAt,
    publishedAt: path.publishedAt,
  };
}

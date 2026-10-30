import { Industry } from '../../models/Industry.js';
import { IndustryTrendSnapshot } from '../../models/IndustryTrendSnapshot.js';
import { Role } from '../../models/Role.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function publicIndustry(industry, roleCount = 0) {
  return {
    industryId: industry.industryId,
    slug: industry.slug,
    name: industry.name,
    summary: industry.summary,
    description: industry.description,
    iconKey: industry.iconKey,
    roleCount,
    contentVersion: industry.contentVersion,
  };
}

export async function listPublishedIndustries({ q = '', page = 1, limit = 12 }) {
  const filter = { lifecycle: 'published' };
  if (q) {
    const search = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: search }, { summary: search }, { description: search }];
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Industry.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Industry.countDocuments(filter),
  ]);
  const industryIds = items.map((item) => item.industryId);
  const counts = industryIds.length
    ? await Role.aggregate([
        { $match: { lifecycle: 'published', industryIds: { $in: industryIds }, publishedPathVersion: { $ne: null } } },
        { $unwind: '$industryIds' },
        { $match: { industryIds: { $in: industryIds } } },
        { $group: { _id: '$industryIds', count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(counts.map((item) => [item._id, item.count]));
  return {
    items: items.map((item) => publicIndustry(item, countMap.get(item.industryId) || 0)),
    pagination: { page, limit, total, pageCount: Math.ceil(total / limit) },
  };
}

export async function getPublishedIndustry(industryId) {
  const industry = await Industry.findOne({ industryId, lifecycle: 'published' }).lean();
  if (!industry) return null;
  const roleCount = await Role.countDocuments({
    lifecycle: 'published', industryIds: industry.industryId, publishedPathVersion: { $ne: null },
  });
  const trends = await IndustryTrendSnapshot.find({
    industryId: industry.industryId,
    lifecycle: 'published',
    expiresAt: { $gt: new Date() },
    reviewedAt: { $ne: null },
  }).sort({ checkedAt: -1 }).limit(6).lean();
  return {
    ...publicIndustry(industry, roleCount),
    trends: trends.map((trend) => ({
      trendType: trend.trendType,
      title: trend.title,
      summary: trend.summary,
      checkedAt: trend.checkedAt,
      expiresAt: trend.expiresAt,
    })),
  };
}


export async function listReviewedIndustryTrends({ industryId, limit = 6 }) {
  const filter = {
    lifecycle: 'published',
    reviewedAt: { $ne: null },
    expiresAt: { $gt: new Date() },
  };
  if (industryId) filter.industryId = industryId;
  const snapshots = await IndustryTrendSnapshot.find(filter).sort({ checkedAt: -1 }).limit(limit).lean();
  const ids = [...new Set(snapshots.map((snapshot) => snapshot.industryId))];
  const industries = ids.length
    ? await Industry.find({ industryId: { $in: ids }, lifecycle: 'published' }).select('industryId name').lean()
    : [];
  const names = new Map(industries.map((industry) => [industry.industryId, industry.name]));
  return snapshots.map((snapshot) => ({
    industryId: snapshot.industryId,
    industryName: names.get(snapshot.industryId) || '',
    trendType: snapshot.trendType,
    title: snapshot.title,
    summary: snapshot.summary,
    checkedAt: snapshot.checkedAt,
    expiresAt: snapshot.expiresAt,
  })).filter((item) => item.industryName);
}

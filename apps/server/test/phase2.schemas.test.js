import test from 'node:test';
import assert from 'node:assert/strict';
import { industryListQuerySchema } from '../src/modules/industries/industry.schemas.js';
import { roleListQuerySchema } from '../src/modules/roles/role.schemas.js';
import { careerGoalSelectionSchema } from '../src/modules/career-goals/career-goal.schemas.js';

test('industry list query applies bounded pagination defaults', () => {
  assert.deepEqual(industryListQuerySchema.parse({}), { q: '', page: 1, limit: 12 });
  assert.equal(industryListQuerySchema.parse({ page: '2', limit: '24' }).limit, 24);
  assert.equal(industryListQuerySchema.safeParse({ limit: '1000' }).success, false);
});

test('role list query normalizes filters and bounds page size', () => {
  const parsed = roleListQuerySchema.parse({ q: '  engineer ', industryId: 'software-engineering', page: '3', limit: '18' });
  assert.equal(parsed.q, 'engineer');
  assert.equal(parsed.page, 3);
  assert.equal(parsed.limit, 18);
  assert.equal(roleListQuerySchema.safeParse({ q: 'x'.repeat(101) }).success, false);
});

test('career goal selection requires canonical published catalogue references', () => {
  const valid = careerGoalSelectionSchema.parse({
    industryId: 'software-engineering',
    roleId: 'software-engineer',
    rolePathVersionId: '65f1b4a01020304050607080',
    goalType: 'next_opportunity',
    targetTimeline: '3-6 months',
  });
  assert.equal(valid.selectionSource, 'career_selection');
  assert.equal(careerGoalSelectionSchema.safeParse({ industryId: 'x', roleId: 'y', goalType: 'unknown' }).success, false);
});

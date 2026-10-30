import { z } from 'zod';

const pagination = {
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
};

export const industryListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  ...pagination,
}).strict();

export const industryIdSchema = z.string().trim().toLowerCase().min(1).max(100).regex(/^[a-z0-9][a-z0-9-]*$/);

export const industryTrendQuerySchema = z.object({
  industryId: z.string().trim().toLowerCase().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(12).default(6),
}).strict();

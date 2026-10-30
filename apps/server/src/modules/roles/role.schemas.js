import { z } from 'zod';

export const roleListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  industryId: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
}).strict();

export const roleIdSchema = z.string().trim().toLowerCase().min(1).max(100).regex(/^[a-z0-9][a-z0-9-]*$/);

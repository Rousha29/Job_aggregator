import { z } from 'zod';

export const offersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().max(100).default(''),
});

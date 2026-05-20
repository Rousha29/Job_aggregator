import { z } from 'zod';

export const offersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(100).optional(),
  contractTypes: z.union([z.string(), z.array(z.string())]).optional(),
  'contractTypes[]': z.union([z.string(), z.array(z.string())]).optional(),
  remote: z.union([z.string(), z.array(z.string())]).optional(),
  'remote[]': z.union([z.string(), z.array(z.string())]).optional(),
  salaryMin: z.coerce.number().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  'skills[]': z.union([z.string(), z.array(z.string())]).optional(),
});

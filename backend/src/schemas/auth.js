import { z } from 'zod';

export const registerSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  mail: z.string().email(),
  password: z.string().min(8).max(128),
  confirmation: z.string()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

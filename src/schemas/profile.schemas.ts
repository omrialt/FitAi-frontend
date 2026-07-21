import { z } from 'zod';

/**
 * Profile update validation schema
 */
export const profileSchema = z.object({
  fullName: z.string().min(2, 'validation.fullNameMin'),
  email: z.string().email('validation.validEmail'),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(0).max(300).optional().or(z.literal('')),
  target: z.enum(['maintain', 'cut', 'bulk']).optional(),
  isActive: z.boolean(),
  password: z.string().min(6, 'validation.passwordMin').optional().or(z.literal('')),
  avatarUrl: z.string().url('validation.invalidUrl').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

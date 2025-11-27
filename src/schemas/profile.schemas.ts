import { z } from 'zod';

/**
 * Profile update validation schema
 */
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(0).max(300).optional().or(z.literal('')),
  target: z.enum(['maintain', 'cut', 'bulk']).optional(),
  isActive: z.boolean(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

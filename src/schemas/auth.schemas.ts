import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMin'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMin'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'validation.fullNameMin'),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.union([z.date(), z.string()]).pipe(
    z.coerce.date({
      message: 'validation.validDate',
    })
  ).refine((date) => date <= new Date(), {
    message: 'validation.birthDateFuture',
  }),
  role: z.enum(['user', 'trainer'], { message: 'validation.selectRole' }),
  height: z.number().min(50).max(300).optional(),
  target: z.enum(['maintain', 'cut', 'bulk'], { message: 'validation.selectTarget' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'validation.passwordsDontMatch',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Complete profile form validation schema (for Google OAuth users)
 */
export const completeProfileSchema = z.object({
  firstName: z.string().min(2, 'validation.firstNameMin'),
  lastName: z.string().min(2, 'validation.lastNameMin'),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.union([z.date(), z.string()]).pipe(
    z.coerce.date({
      message: 'validation.validDate',
    })
  ).refine((date) => date <= new Date(), {
    message: 'validation.birthDateFuture',
  }),
  role: z.enum(['user', 'trainer'], { message: 'validation.selectRole' }),
  height: z.number().min(50).max(300).optional(),
  target: z.enum(['maintain', 'cut', 'bulk'], { message: 'validation.selectTarget' }),
});

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

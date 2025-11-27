import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.union([z.date(), z.string()]).pipe(
    z.coerce.date({
      message: 'Please enter a valid date',
    })
  ).refine((date) => date <= new Date(), {
    message: 'Birth date cannot be in the future',
  }),
  role: z.enum(['user', 'trainer'], { message: 'Please select your role' }),
  height: z.number().min(50).max(300).optional(),
  target: z.enum(['maintain', 'cut', 'bulk'], { message: 'Please select your target' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Complete profile form validation schema (for Google OAuth users)
 */
export const completeProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.union([z.date(), z.string()]).pipe(
    z.coerce.date({
      message: 'Please enter a valid date',
    })
  ).refine((date) => date <= new Date(), {
    message: 'Birth date cannot be in the future',
  }),
  role: z.enum(['user', 'trainer'], { message: 'Please select your role' }),
  height: z.number().min(50).max(300).optional(),
  target: z.enum(['maintain', 'cut', 'bulk'], { message: 'Please select your target' }),
});

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

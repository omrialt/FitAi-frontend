/**
 * Training plan validation schemas
 */

import { z } from 'zod';

export const trainingPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  programType: z.enum(['fixedDays', 'rotation']).optional(),
  focus: z.string().optional(),
  estimatedDuration: z.number().optional(),
  estimatedCalories: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rotationCycleLength: z.number().optional(),
  days: z.array(z.any()).optional(),
  sharedAccess: z.array(z.any()).optional(),
});

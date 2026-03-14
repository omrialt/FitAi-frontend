/**
 * Nutrition types and interfaces
 * Maps to backend NutritionPlan schema
 */

import type { User } from './user.types';

import type { AccessLevel, ObjectType, SharedAccessEntry } from './training-plan.types';
export type { AccessLevel, ObjectType, SharedAccessEntry };

// Enums
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Target = 'maintain' | 'cut' | 'bulk';

// Food item
export interface Food {
  name: string;
  quantity?: number | null;
  unit?: 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb' | 'cup' | 'tbsp' | 'tsp' | 'unit' | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Meal
export interface Meal {
  mealType: MealType;
  foods: Food[];
}

// Rating
export interface Rating {
  userId: string | User;
  rating: number;
  comment?: string;
  createdAt: Date | string;
}

// SharedAccessEntry is re-exported from training-plan.types

// Main nutrition plan interface
export interface NutritionPlan {
  _id: string;
  userId: string | User;
  title: string;
  description: string;
  totalCalories: number;
  target?: Target;
  meals: Meal[];
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
  sharedWith: string[];
  sharedAccess: SharedAccessEntry[];
  activeByUsers: string[] | User[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// UI-only filter types
export interface NutritionFilters {
  target?: Target;
  minRating?: number;
  minCalories?: number;
  maxCalories?: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NutritionPlansResponse {
  items: NutritionPlan[];
  total: number;
  page: number;
  limit: number;
  pages: number; // Backend returns 'pages' not 'totalPages'
}

// API Response wrapper (backend uses TransformInterceptor)
export interface NutritionPlansApiResponse {
  data: NutritionPlansResponse;
  timestamp: string;
  path: string;
}

// API response wrapper for array endpoints (TransformInterceptor)
export interface NutritionPlansArrayResponse {
  data: NutritionPlan[];
  timestamp: string;
  path: string;
}

// Export data type
export interface ExportNutritionData {
  nutritionPlans: NutritionPlan[];
  exportDate: string;
  filters?: NutritionFilters;
}

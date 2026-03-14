/**
 * Prop types for all nutrition plan components (list, details, edit-modal)
 */

import type {
  NutritionPlan,
  NutritionFilters,
  Meal,
  Food,
  MealType,
  Rating,
} from './nutrition.types';
import type { User } from './auth.types';

// ─── Main list components ──────────────────────────────────────────────────

export interface DeleteNutritionModalProps {
  opened: boolean;
  onClose: () => void;
  nutritionPlan: NutritionPlan | null;
  onConfirm: () => void;
}

export interface EditNutritionModalProps {
  opened: boolean;
  onClose: () => void;
  nutritionPlan: NutritionPlan | null;
  onSave: (data: Partial<NutritionPlan>) => void;
  onCreate?: (data: Partial<NutritionPlan>) => void;
  createMode?: boolean;
  allUsers: User[];
}

export interface NutritionsActionsMenuProps {
  nutritionPlan: NutritionPlan;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (nutritionPlan: NutritionPlan) => void;
  onExportExcel: (nutritionPlan: NutritionPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

export interface NutritionsCardProps {
  nutritionPlan: NutritionPlan;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (nutritionPlan: NutritionPlan) => void;
  onExportExcel: (nutritionPlan: NutritionPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

export interface NutritionsCardListProps {
  nutritionPlans: NutritionPlan[];
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (nutritionPlan: NutritionPlan) => void;
  onExportExcel: (nutritionPlan: NutritionPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

export interface NutritionsFiltersProps {
  filters: NutritionFilters;
  onFiltersChange: (filters: NutritionFilters) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export interface NutritionsHeaderProps {
  onCreateNew?: () => void;
}

export interface NutritionsTableProps {
  nutritionPlans: NutritionPlan[];
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (nutritionPlan: NutritionPlan) => void;
  onExportExcel: (nutritionPlan: NutritionPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

// ─── Details sub-components ────────────────────────────────────────────────

export interface AddRatingProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  loading?: boolean;
}

export interface EditNutritionPlanModalProps {
  opened: boolean;
  onClose: () => void;
  plan: NutritionPlan;
  onSave: (data: Partial<NutritionPlan>) => Promise<void>;
}

export interface MealSectionProps {
  meals: Meal[];
}

export interface RatingsSectionProps {
  ratings: Rating[];
}

// ─── Edit-modal sub-components ─────────────────────────────────────────────

export interface FoodItemProps {
  food: Food;
  onRemove: () => void;
  onUpdate: (updates: Partial<Food>) => void;
}

export interface MealCardProps {
  id: string;
  meal: Meal;
  mealIndex: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<Meal>) => void;
  onAddFood: () => void;
  onRemoveFood: (foodIndex: number) => void;
  onUpdateFood: (foodIndex: number, updates: Partial<Food>) => void;
}

export interface MealsSectionProps {
  meals: Meal[];
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (index: number) => void;
  onUpdateMeal: (index: number, updates: Partial<Meal>) => void;
  onAddFood: (mealIndex: number) => void;
  onRemoveFood: (mealIndex: number, foodIndex: number) => void;
  onUpdateFood: (
    mealIndex: number,
    foodIndex: number,
    updates: Partial<Food>
  ) => void;
  onReorderMeals: (meals: Meal[]) => void;
}

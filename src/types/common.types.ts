/**
 * Prop types for shared common components
 */

import type { User } from './auth.types';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
  mb?: string | number;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export type PlanType = 'nutrition' | 'training';

export interface BasePlanData {
  title: string;
  description: string;
  target?: 'maintain' | 'cut' | 'bulk';
  createdAt?: string | Date;
}

export interface NutritionPlanData extends BasePlanData {
  totalCalories: number;
  averageRating: number;
  totalRatings: number;
  meals: Array<{
    foods: Array<{
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }>;
}

export interface TrainingPlanData extends BasePlanData {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  estimatedCalories?: number;
  estimatedDuration?: number;
  focus?: string;
  programType?: 'fixedDays' | 'rotation';
  rotationCycleLength?: number | null;
}

export interface PlanHeaderProps {
  planType: PlanType;
  plan: NutritionPlanData | TrainingPlanData;
  isOwner: boolean;
  onEdit: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  creatorName?: string;
}

export type SharedObjectType = 'trainingPlan' | 'nutritionPlan';

export interface SharedAccessSectionProps {
  allUsers: User[];
  sharedAccess: Array<{ accessLevel: string; userId: string }>;
  handleViewAccessChange: (userIds: string[]) => void;
  objectType: SharedObjectType;
}

/** Permissive access entry used by SharedWithSection (fields are optional for flexibility) */
export interface SharedWithEntry {
  userId: string;
  accessLevel?: string;
  objectType?: string;
}

export interface SharedWithSectionProps {
  sharedAccess: SharedWithEntry[];
  allUsers: User[];
  title?: string;
  emptyMessage?: string;
  showActions?: boolean;
  onShare?: (userId: string, accessLevel: string) => Promise<void>;
  onRevoke?: (userId: string) => Promise<void>;
  loading?: boolean;
}

export interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
  color?: string;
}

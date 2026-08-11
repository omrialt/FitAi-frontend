/**
 * Prop types for dashboard section components
 */

import type { NutritionPlan } from './nutrition.types';
import type { TrainingPlan } from './training-plan.types';
import type { CurrentStatus } from './current-status.types';
import type { PhysicalData, WeightProgressData } from './physical-data.types';
import type { ProgressStats, AiRecommendation } from './dashboard.types';
import type { User } from './auth.types';

export interface ActiveNutritionCardProps {
  plan: NutritionPlan | null;
}

export interface ActiveTrainingCardProps {
  plan: TrainingPlan | null;
  currentStatus: CurrentStatus | null;
}

export interface BodyProgressCardProps {
  latestPhysicalData: PhysicalData | null;
  weightProgress: WeightProgressData | null;
  progressStats: ProgressStats | null;
  onDataUpdate?: () => void;
}

export interface QuickStatsCardsProps {
  trainingPlans: TrainingPlan[];
  nutritionPlans: NutritionPlan[];
  progressStats: ProgressStats | null;
  bmi: { bmi: number; category: string } | null;
}

export interface RecentRecommendationsProps {
  recommendations: AiRecommendation[];
}

export interface WelcomeSectionProps {
  user: User;
  currentStatus: CurrentStatus | null;
}

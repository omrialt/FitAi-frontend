/**
 * Training types and interfaces
 * Maps to backend TrainingPlan schema
 */

import type { TrainingPlan } from './training-plan.types';

// Re-export backend types
export type { TrainingPlan, Difficulty, ProgramType } from './training-plan.types';

// UI-only filter types
export type TrainingCreator = 'me' | 'coach' | 'system';

export interface TrainingFilters {
  creator?: TrainingCreator;
  difficulty?: string;
  target?: string;
}

export interface TrainingTableData {
  trainings: TrainingPlan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExportTrainingData {
  trainings: TrainingPlan[];
  exportDate: string;
  filters?: TrainingFilters;
}

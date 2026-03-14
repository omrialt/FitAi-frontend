/**
 * Export hook types for training plan and nutrition plan exports (PDF / Excel)
 */

import type { TrainingPlan } from './training-plan.types';
import type { NutritionPlan } from './nutrition.types';

export interface UseExportOptions {
  filename?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseExportReturn {
  exportToPDF: (data: TrainingPlan[]) => void;
  exportToExcel: (data: TrainingPlan[]) => void;
  isExporting: boolean;
  error: Error | null;
}

export interface UseNutritionExportOptions {
  filename?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseNutritionExportReturn {
  exportToPDF: (data: NutritionPlan[]) => void;
  exportToExcel: (data: NutritionPlan[]) => void;
  isExporting: boolean;
  error: Error | null;
}

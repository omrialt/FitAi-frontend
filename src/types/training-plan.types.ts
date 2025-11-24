// Backend schema types (matching training-plan.schema.ts exactly)
export type ExerciseType = 'regular' | 'dropset' | 'superset';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type AccessLevel = 'view' | 'edit';
export type ObjectType = 'trainingPlan' | 'nutritionPlan';
export type ProgramType = 'fixedDays' | 'rotation';

export interface WeightHistoryEntry {
  date: string;
  weight: number;
  reps: number;
}

export interface ExerciseSet {
  targetReps: number;
  targetWeight: number;
  performedReps?: number;
  performedWeight?: number;
  history: WeightHistoryEntry[];
}

export interface Exercise {
  name: string;
  muscleGroup: string;
  type: ExerciseType;
  supersetGroupId?: string | null;
  notes?: string;
  video?: string;
  sets: ExerciseSet[];
}

export interface TrainingDay {
  dayName: string;
  dayOfWeek: number;
  plannedDate?: string;
  exercises: Exercise[];
}

export interface SharedAccessEntry {
  userId: string;
  accessLevel: AccessLevel;
  objectType: ObjectType;
}

export interface TrainingPlan {
  _id: string;
  userId: string;
  trainerId?: string | null;
  title: string;
  description: string;
  days: TrainingDay[];
  difficulty: Difficulty;
  sharedWith: string[];
  sharedAccess: SharedAccessEntry[];
  // Lifecycle fields
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  // Program meta fields
  programType?: ProgramType;
  rotationCycleLength?: number;
  focus?: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingPlansResponse {
  items: TrainingPlan[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

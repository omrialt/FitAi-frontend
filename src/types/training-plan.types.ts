// Backend schema types (matching training-plan.schema.ts exactly)
export type ExerciseType = 'regular' | 'dropset' | 'superset';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Target = 'maintain' | 'cut' | 'bulk';
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
  userId: string | { _id: string; fullName: string; email: string };
  trainerId?: string | { _id: string; fullName: string; email: string } | null;
  title: string;
  description: string;
  days: TrainingDay[];
  difficulty: Difficulty;
  target?: Target;
  sharedWith: string[];
  sharedAccess: SharedAccessEntry[];
  activeByUsers: string[] | Array<{ _id: string; fullName: string; email: string }>;
  /** A pattern kept in the trainer's library, on nobody's calendar. */
  isTemplate?: boolean;
  // Clone tracking fields
  initialParentId?: string | null;
  syncWithParent?: boolean;
  // Lifecycle fields
  startDate?: string;
  endDate?: string | null;
  isActive: boolean;
  // Program meta fields
  programType?: ProgramType;
  rotationCycleLength?: number | null;
  focus?: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * What happened to one client in a bulk assignment.
 *
 * A row per client rather than one overall verdict: a batch where two of five
 * clients were skipped is neither a success nor a failure, and the trainer has
 * to be told which two.
 */
export type AssignmentStatus = 'created' | 'skipped' | 'failed';
export type AssignmentReason =
  | 'not_your_client'
  | 'already_assigned'
  | 'write_failed';

export interface AssignmentResult {
  clientId: string;
  status: AssignmentStatus;
  planId?: string;
  reason?: AssignmentReason;
}

export interface TrainingPlansResponse {
data: TrainingPlansResponseData;
}
export interface TrainingPlansResponseData {
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

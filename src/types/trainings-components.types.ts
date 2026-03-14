/**
 * Prop types for all training plan components (list, details, edit-modal)
 */

import type {
  TrainingPlan,
  TrainingDay,
  Exercise,
  WeightHistoryEntry,
  Difficulty,
  Target,
  ProgramType,
} from './training-plan.types';
import type { TrainingFilters } from './training.types';
import type { User } from './auth.types';

// ─── Main list components ──────────────────────────────────────────────────

export interface DeleteTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: TrainingPlan | null;
  onConfirm: () => void;
}

export interface EditTrainingModalProps {
  opened: boolean;
  onClose: () => void;
  training: TrainingPlan | null;
  onSave: (data: Partial<TrainingPlan>) => void;
  onCreate?: (data: Partial<TrainingPlan>) => void;
  createMode?: boolean;
  allUsers: User[];
}

export interface TrainingsActionsMenuProps {
  training: TrainingPlan;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

export interface TrainingsCardProps {
  training: TrainingPlan;
  isCoach?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

export interface TrainingsCardListProps {
  trainings: TrainingPlan[];
  isCoach?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

export interface TrainingsFiltersProps {
  filters: TrainingFilters;
  onFiltersChange: (filters: TrainingFilters) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export interface TrainingsHeaderProps {
  onCreateNew?: () => void;
}

export interface TrainingsTableProps {
  trainings: TrainingPlan[];
  isAdmin?: boolean;
  currentUserId?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onExportPDF: (training: TrainingPlan) => void;
  onExportExcel: (training: TrainingPlan) => void;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
}

// ─── Details sub-components ────────────────────────────────────────────────

export interface DaysSectionProps {
  days: TrainingDay[];
  onVideoClick: (videoUrl: string) => void;
  onExerciseUpdate?: (
    dayIndex: number,
    exerciseIndex: number,
    updatedExercise: Exercise
  ) => void;
}

export interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  onVideoClick: (videoUrl: string) => void;
  onExerciseUpdate?: (updatedExercise: Exercise) => void;
}

export interface ChartDataPoint {
  date: string;
  weight: number;
  reps: number;
  isTarget?: boolean;
}

export interface SetHistoryChartProps {
  chartData: ChartDataPoint[];
}

export interface SetHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  history: WeightHistoryEntry[];
  onHistoryChange: (
    newHistory: WeightHistoryEntry[],
    syncToAllSets?: boolean
  ) => void;
  setNumber: number;
  exerciseName: string;
  targetWeight: number;
  targetReps: number;
}

export interface VideoModalProps {
  opened: boolean;
  onClose: () => void;
  videoUrl: string;
}

// ─── Edit-modal sub-components ─────────────────────────────────────────────

export interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  target: Target | undefined;
  setTarget: (value: Target | undefined) => void;
  programType: ProgramType;
  setProgramType: (value: ProgramType) => void;
  focus: string;
  setFocus: (value: string) => void;
  rotationCycleLength: number | undefined | null;
  setRotationCycleLength: (value: number | undefined | null) => void;
}

export interface ExerciseItemProps {
  exercise: Exercise;
  exerciseIndex: number;
  dayIndex: number;
  onRemove: () => void;
  updateExerciseField: (
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: unknown
  ) => void;
  addSet: (dayIndex: number, exerciseIndex: number) => void;
  removeSet: (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => void;
  updateSet: (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    updates: Record<string, unknown>
  ) => void;
  id: string;
}

export interface ProgramDetailsSectionProps {
  estimatedDuration: number | undefined;
  setEstimatedDuration: (value: number | undefined) => void;
  estimatedCalories: number | undefined;
  setEstimatedCalories: (value: number | undefined) => void;
  startDate: string | undefined;
  setStartDate: (value: string | undefined) => void;
  endDate: string | undefined | null;
  setEndDate: (value: string | undefined | null) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
}

export interface SharedAccessSectionProps {
  allUsers: User[];
  sharedAccess: Array<{ accessLevel: string; userId: string }>;
  handleViewAccessChange: (userIds: string[]) => void;
  handleEditAccessChange: (userIds: string[]) => void;
}

export interface TrainingDayItemProps {
  day: TrainingDay;
  dayIndex: number;
  onRemove: () => void;
  onDuplicate: () => void;
  onUpdate: (updates: Partial<TrainingDay>) => void;
  addExercise: (dayIndex: number) => void;
  removeExercise: (dayIndex: number, exerciseIndex: number) => void;
  updateExerciseField: (
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: unknown
  ) => void;
  addSet: (dayIndex: number, exerciseIndex: number) => void;
  removeSet: (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => void;
  updateSet: (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    updates: Record<string, unknown>
  ) => void;
}

export interface TrainingDaysSectionProps {
  localDays: TrainingDay[];
  addDay: () => void;
  removeDay: (index: number) => void;
  duplicateDay: (index: number) => void;
  updateDay: (index: number, updates: Partial<TrainingDay>) => void;
  addExercise: (dayIndex: number) => void;
  removeExercise: (dayIndex: number, exerciseIndex: number) => void;
  updateExerciseField: (
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: unknown
  ) => void;
  addSet: (dayIndex: number, exerciseIndex: number) => void;
  removeSet: (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number
  ) => void;
  updateSet: (
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    updates: Record<string, unknown>
  ) => void;
}

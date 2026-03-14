export type Phase = 'bulk' | 'cut' | 'maintain';

export interface CurrentStatus {
  _id: string;
  userId: string;
  // Backend populates these refs — can be string ID or full populated object
  activeTrainingPlanId: string | Record<string, unknown> | null;
  activeMenuId: string | Record<string, unknown> | null;
  lastWorkoutDate: Date | null;
  nextWorkoutDate: Date | null;
  phase: Phase;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateCurrentStatusDto {
  activeTrainingPlanId?: string | null;
  activeMenuId?: string | null;
  lastWorkoutDate?: Date | null;
  nextWorkoutDate?: Date | null;
  phase?: Phase;
}

export interface SetActiveTrainingPlanDto {
  activeTrainingPlanId: string | null;
}

export interface SetActiveMenuDto {
  activeMenuId: string | null;
}

export interface SetPhaseDto {
  phase: Phase;
}

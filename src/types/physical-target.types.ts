/**
 * Physical Target types — date-bound targets for physical data metrics
 */

export type TargetMetric =
  | 'weightKg'
  | 'bodyFatPercent'
  | 'chest'
  | 'waist'
  | 'hips'
  | 'arms'
  | 'legs';

export type TargetValues = Partial<Record<TargetMetric, number>>;

export type PhysicalTargetStatus = 'active' | 'achieved' | 'abandoned';

export interface PhysicalTarget {
  _id: string;
  userId: string;
  name?: string;
  targetDate: string;
  targetValues: TargetValues;
  startValues?: TargetValues;
  startDate: string;
  status: PhysicalTargetStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePhysicalTargetDto {
  userId?: string;
  name?: string;
  targetDate: string;
  targetValues: TargetValues;
  notes?: string;
}

export interface UpdatePhysicalTargetDto {
  name?: string;
  targetDate?: string;
  targetValues?: TargetValues;
  notes?: string;
  status?: PhysicalTargetStatus;
}

export interface MetricProgress {
  metric: TargetMetric;
  start: number | null;
  current: number | null;
  target: number;
  percentComplete: number;
}

export interface TargetProgress {
  targetId: string;
  name?: string;
  targetDate: string;
  daysRemaining: number;
  status: PhysicalTargetStatus;
  metrics: MetricProgress[];
}

/**
 * Physical Data types for fitness tracking
 */

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
}

export interface PhysicalData {
  _id: string;
  userId: string;
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number;
  measurements?: Measurements;
  dateRecorded: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePhysicalDataDto {
  userId: string;
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number;
  measurements?: Measurements;
  dateRecorded?: string;
}

export interface UpdatePhysicalDataDto {
  heightCm?: number;
  weightKg?: number;
  bodyFatPercent?: number;
  measurements?: Measurements;
  dateRecorded?: string;
}

export interface WeightProgressData {
  data: Array<{ date: Date; weight: number }>;
  change: number;
}

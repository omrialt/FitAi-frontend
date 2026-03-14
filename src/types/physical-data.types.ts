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

export interface RangeSegment {
  label: string;
  min: number;
  max: number;
  color: string;
}

export interface BMIRanges {
  ranges: RangeSegment[];
  explanation: string;
}

export interface WeightRanges {
  minWeight: number;
  maxWeight: number;
  ranges: RangeSegment[];
  explanation: string;
}

export interface BodyFatRanges {
  ranges: RangeSegment[];
  explanation: string;
}

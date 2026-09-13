/**
 * Prop types for all physical-data sub-components (cards, charts, modals, table)
 */

import type {
  PhysicalData,
  CreatePhysicalDataDto,
  UpdatePhysicalDataDto,
  RangeSegment,
} from './physical-data.types';

// ─── Header ────────────────────────────────────────────────────────────────

export interface PhysicalDataHeaderProps {
  onAddMeasurement: () => void;
  onSetTarget: () => void;
}

// ─── Cards ─────────────────────────────────────────────────────────────────

export interface LatestRecordCardProps {
  record: PhysicalData;
  previousRecord?: PhysicalData | null;
  bmi?: { bmi: number; category: string };
}

export interface MetricInfoTooltipProps {
  metricName: string;
  explanation: string;
  ranges: RangeSegment[];
  userValue: number;
  unit?: string;
  iconColor?: string;
}

export interface NoRecordsMessageProps {
  onAddMeasurement: () => void;
}

export interface RangeBarProps {
  ranges: RangeSegment[];
  userValue: number;
  unit?: string;
}

// ─── Charts ────────────────────────────────────────────────────────────────

export interface MeasurementsChartProps {
  data: PhysicalData[];
}

// ─── Modals ────────────────────────────────────────────────────────────────

export interface DeleteMeasurementModalProps {
  opened: boolean;
  onClose: () => void;
  measurement: PhysicalData | null;
  onConfirm: () => Promise<void>;
}

export interface MeasurementModalProps {
  opened: boolean;
  onClose: () => void;
  measurement?: PhysicalData | null;
  lastRecord?: PhysicalData | null;
  onSave: (data: CreatePhysicalDataDto) => Promise<void>;
  onUpdate?: (id: string, data: UpdatePhysicalDataDto) => Promise<void>;
}

// ─── Table ─────────────────────────────────────────────────────────────────

export interface MeasurementsTableProps {
  data: PhysicalData[];
  onEdit: (measurement: PhysicalData) => void;
  onDelete: (measurement: PhysicalData) => void;
}

export interface TableImprovementCellProps {
  value: string;
}

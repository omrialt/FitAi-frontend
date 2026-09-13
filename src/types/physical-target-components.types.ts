/**
 * Prop types for physical-target sub-components (modal, list, card)
 */

import type {
  PhysicalTarget,
  CreatePhysicalTargetDto,
  UpdatePhysicalTargetDto,
  TargetProgress,
} from './physical-target.types';

export interface TargetModalProps {
  opened: boolean;
  onClose: () => void;
  target?: PhysicalTarget | null;
  onSave: (data: CreatePhysicalTargetDto) => Promise<void>;
  onUpdate: (id: string, data: UpdatePhysicalTargetDto) => Promise<void>;
}

export interface TargetsListProps {
  targets: PhysicalTarget[];
  progress: TargetProgress[];
  onEdit: (target: PhysicalTarget) => void;
  onDelete: (target: PhysicalTarget) => void;
}

export interface TargetCardProps {
  target: PhysicalTarget;
  progress?: TargetProgress;
  onEdit: () => void;
  onDelete: () => void;
}

export interface DeleteTargetModalProps {
  opened: boolean;
  onClose: () => void;
  target: PhysicalTarget | null;
  onConfirm: () => Promise<void>;
}

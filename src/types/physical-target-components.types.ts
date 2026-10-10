/**
 * Prop types for physical-target sub-components (modal, list, card)
 */

import type {
  PhysicalTarget,
  PhysicalTargetStatus,
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
  onStatusChange: (target: PhysicalTarget, status: PhysicalTargetStatus) => void;
  /** Whether the viewer may edit, close or delete this target. Default: yes. */
  canManage?: (target: PhysicalTarget) => boolean;
  /** A line saying who set the target, when that is worth saying. */
  attributionFor?: (target: PhysicalTarget) => string | null;
  /** Overrides the empty state's text (e.g. on a trainer's view of a client). */
  emptyTitle?: string;
  emptyText?: string;
}

export interface TargetCardProps {
  target: PhysicalTarget;
  progress?: TargetProgress;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: PhysicalTargetStatus) => void;
  /** Hides edit, delete and the finish/reopen actions. */
  readOnly?: boolean;
  attribution?: string | null;
}

export interface DeleteTargetModalProps {
  opened: boolean;
  onClose: () => void;
  target: PhysicalTarget | null;
  onConfirm: () => Promise<void>;
}

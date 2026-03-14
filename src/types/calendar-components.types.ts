/**
 * Prop types for calendar components
 */

import type { CalendarEvent } from './calendar.types';

export interface TrainingDayModalProps {
  opened: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export interface WeeklyCalendarProps {
  activeTrainingPlanId?: string;
  autoSyncOnConnect?: boolean;
  onAutoSyncComplete?: () => void;
}

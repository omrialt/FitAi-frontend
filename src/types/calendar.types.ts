import type { Exercise } from './training-plan.types';

export interface CalendarEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'training' | 'google';
  /** Google all-day events span whole days and carry no meaningful time. */
  allDay?: boolean;
  trainingPlanId?: string;
  dayIndex?: number;
  googleEventId?: string;
  exercises?: Exercise[];
}

export interface GoogleCalendarStatus {
  connected: boolean;
  hasRefreshToken: boolean;
}

export interface SyncResult {
  message: string;
  created: number;
  updated: number;
  deleted: number;
}

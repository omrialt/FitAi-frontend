import type { Exercise } from './training-plan.types';

export interface CalendarEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'training' | 'google';
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

/**
 * The food diary.
 *
 * Every call sends `localDay` — the calendar day in the *browser's* timezone.
 * The server deliberately does not compute it: production runs in UTC, so a
 * meal logged at 23:30 in Israel would otherwise be filed under tomorrow. This
 * is the same class of bug as N-21, which counted training weeks from a
 * Thursday epoch and was wrong three days out of every seven.
 */

import api from './api';
import type {
  CreateMealLogInput,
  DailyIntake,
  MealLogEntry,
} from '../types/meal-log.types';

/** `YYYY-MM-DD` for the browser's own calendar day, never UTC. */
export function localDayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const mealLogService = {
  /** Consumed, target and remaining for one day, in a single round trip. */
  getDay: async (day: string = localDayString()): Promise<DailyIntake> => {
    const response = await api.get('/meal-logs/today', { params: { day } });
    return response.data.data;
  },

  /** The same view for a connected client, for the trainer's screen. */
  getDayForClient: async (
    userId: string,
    day: string = localDayString(),
  ): Promise<DailyIntake> => {
    const response = await api.get(`/meal-logs/user/${userId}/day`, {
      params: { day },
    });
    return response.data.data;
  },

  create: async (input: CreateMealLogInput): Promise<MealLogEntry> => {
    const response = await api.post('/meal-logs', input);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/meal-logs/${id}`);
  },

  list: async (from: string, to: string): Promise<MealLogEntry[]> => {
    const response = await api.get('/meal-logs', { params: { from, to } });
    return response.data.data;
  },
};

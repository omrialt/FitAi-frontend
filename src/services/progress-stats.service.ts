/**
 * Progress Stats API Service
 *
 * Backs the workout-count tiles and the weight/fat trend arrows on the
 * dashboard. `GET /progress/:userId` creates a zeroed record on first call, so
 * a brand-new user gets a real (empty) response rather than a 404.
 */

import api from './api';
import type { ProgressStats } from '../types/dashboard.types';

export const progressStatsService = {
  getByUserId: async (userId: string): Promise<ProgressStats> => {
    const response = await api.get(`/progress/${userId}`);
    return response.data.data ?? response.data;
  },

  /**
   * Recompute from measurements and logged sessions. Worth calling after a
   * workout is logged or a measurement saved, since the stored record is a
   * snapshot rather than a live view.
   */
  recalculate: async (userId: string): Promise<ProgressStats> => {
    const response = await api.post(`/progress/${userId}/recalculate`);
    return response.data.data ?? response.data;
  },
};

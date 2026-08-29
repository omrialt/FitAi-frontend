/**
 * Exercise catalogue API.
 *
 * Read-only by design — the catalogue ships with the app and is seeded from
 * the server repo, so there is nothing here to create or edit.
 */

import api from './api';
import type { Exercise, ExerciseSearchQuery } from '../types/exercise.types';

export const exerciseService = {
  /** Search by name in either language, or by alias. */
  search: async (query: ExerciseSearchQuery = {}): Promise<Exercise[]> => {
    const response = await api.get('/exercises', { params: query });
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Exercise> => {
    const response = await api.get(`/exercises/${slug}`);
    return response.data.data;
  },

  /**
   * Other exercises for the same primary muscle — the query the catalogue was
   * built to make possible.
   */
  alternatives: async (slug: string, limit?: number): Promise<Exercise[]> => {
    const response = await api.get(`/exercises/${slug}/alternatives`, {
      params: limit ? { limit } : {},
    });
    return response.data.data;
  },
};

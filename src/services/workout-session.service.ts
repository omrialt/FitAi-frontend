/**
 * Workout Session API Service
 *
 * The training log lives in its own collection rather than inside the plan
 * document, so these calls are independent of whether the plan still exists.
 */

import api from './api';
import type {
  CreateWorkoutSessionDto,
  ExerciseHistory,
  ListWorkoutSessionsQuery,
  WorkoutSession,
  WorkoutStats,
} from '../types/workout-session.types';

export const workoutSessionService = {
  /** Log a completed workout. The server files it against the caller. */
  create: async (data: CreateWorkoutSessionDto): Promise<WorkoutSession> => {
    const response = await api.post('/workout-sessions', data);
    return response.data.data;
  },

  /**
   * A user's log, newest first. A trainer with an accepted connection may pass
   * their client's id here; anyone else gets 403.
   */
  getByUserId: async (
    userId: string,
    query: ListWorkoutSessionsQuery = {},
  ): Promise<WorkoutSession[]> => {
    const response = await api.get(`/workout-sessions/user/${userId}`, {
      params: query,
    });
    return response.data.data;
  },

  /**
   * Personal bests, streak and adherence. `days` sets the adherence window
   * only — streaks and bests are all-time.
   */
  getStats: async (userId: string, days = 30): Promise<WorkoutStats> => {
    const response = await api.get(`/workout-sessions/user/${userId}/stats`, {
      params: { days },
    });
    return response.data.data;
  },

  /**
   * One exercise's progression, one point per day trained. Omitting `name`
   * asks the server for the exercise trained most often, so the chart opens on
   * something real instead of an empty picker.
   *
   * `days` bounds the curve only — `availableExercises` always covers the
   * whole log, so narrowing the window never hides the exercise being viewed.
   */
  getExerciseHistory: async (
    userId: string,
    params: { name?: string; days?: number } = {},
  ): Promise<ExerciseHistory> => {
    const response = await api.get(
      `/workout-sessions/user/${userId}/exercise-history`,
      { params },
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<WorkoutSession> => {
    const response = await api.get(`/workout-sessions/${id}`);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/workout-sessions/${id}`);
  },
};

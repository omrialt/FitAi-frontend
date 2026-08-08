import api from './api';
import type { TrainingPlan, PaginationParams, TrainingPlansResponse } from '../types/training-plan.types';

export const trainingPlanService = {
  // Get all training plans with pagination
  getAll: async (params?: PaginationParams): Promise<TrainingPlansResponse> => {
    const response = await api.get('/training-plans', { params });
    return response.data.data;
  },

  /**
   * Get a single training plan by ID.
   *
   * The backend wraps every response as `{ data, timestamp, path }`
   * (TransformInterceptor), so the plan is at `response.data.data`. This used
   * to return `response.data` — the envelope — while its signature promised a
   * `TrainingPlan`, so callers got an object with no `days` and TypeScript had
   * no way to notice. That silently broke `duplicate()` (which spreads the
   * result) and the dashboard's fallback lookup for an active plan.
   */
  getById: async (id: string): Promise<TrainingPlan> => {
    const response = await api.get(`/training-plans/${id}`);
    return response.data.data;
  },

  // Create a new training plan
  create: async (data: Partial<TrainingPlan>): Promise<TrainingPlan> => {
    const response = await api.post('/training-plans', data);
    return response.data;
  },

  // Update a training plan
  update: async (id: string, data: Partial<TrainingPlan>): Promise<TrainingPlan> => {
    const response = await api.put(`/training-plans/${id}`, data);
    return response.data;
  },


  // Delete a training plan (calls backend endpoint)
  deletePlan: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/training-plans/${id}`);
    return response.data;
  },

  // Duplicate a training plan
  duplicate: async (id: string, title: string): Promise<TrainingPlan> => {
    const original = await trainingPlanService.getById(id);
    const duplicated = {
      ...original,
      _id: undefined,
      title,
      createdAt: undefined,
      updatedAt: undefined,
    };
    return trainingPlanService.create(duplicated);
  },

  // Share training plan with users (creates deep clones)
  share: async (planId: string, userIds: string[]): Promise<TrainingPlan[]> => {
    const response = await api.post(`/training-plans/${planId}/share`, { userIds });
    return response.data;
  },

  // Revoke share access
  revokeShare: async (planId: string, userId: string): Promise<TrainingPlan> => {
    const response = await api.delete(`/training-plans/${planId}/share/${userId}`);
    return response.data;
  },

  /**
   * Plans owned by a user plus those shared with them.
   *
   * Also unwraps the envelope now. `useDashboard` re-unwraps defensively and
   * passes the value straight through when there is nothing left to unwrap, so
   * it keeps working either way.
   */
  getByUserWithShared: async (userId: string): Promise<TrainingPlan[]> => {
    const response = await api.get(`/training-plans/user/${userId}/with-shared`);
    return response.data.data;
  },

  // Get child clones of a parent plan
  getChildClones: async (parentId: string): Promise<TrainingPlan[]> => {
    const response = await api.get(`/training-plans/${parentId}/clones`);
    return response.data;
  },

  // Activate a training plan for the current user
  activate: async (planId: string): Promise<TrainingPlan> => {
    const response = await api.post(`/training-plans/${planId}/activate`);
    return response.data;
  },
};
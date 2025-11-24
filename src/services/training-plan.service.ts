import api from './api';
import type { TrainingPlan, PaginationParams, TrainingPlansResponse } from '../types/training-plan.types';

export const trainingPlanService = {
  // Get all training plans with pagination
  getAll: async (params?: PaginationParams): Promise<TrainingPlansResponse> => {
    const response = await api.get('/training-plans', { params });
    return response.data.data;
  },

  // Get a single training plan by ID
  getById: async (id: string): Promise<TrainingPlan> => {
    const response = await api.get(`/training-plans/${id}`);
    return response.data;
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

  // Delete a training plan
  delete: async (id: string): Promise<{ message: string }> => {
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

  // Share training plan with users
  share: async (planId: string, userIds: string[]): Promise<TrainingPlan> => {
    const response = await api.post(`/training-plans/${planId}/share`, { userIds });
    return response.data;
  },

  // Revoke share access
  revokeShare: async (planId: string, userId: string): Promise<TrainingPlan> => {
    const response = await api.delete(`/training-plans/${planId}/share/${userId}`);
    return response.data;
  },

  // Get plans with shared access for a user
  getByUserWithShared: async (userId: string): Promise<TrainingPlan[]> => {
    const response = await api.get(`/training-plans/user/${userId}/with-shared`);
    return response.data;
  },
};
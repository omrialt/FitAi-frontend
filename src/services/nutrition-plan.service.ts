import api from './api';
import type { NutritionPlan, PaginationParams, NutritionPlansResponse } from '../types/nutrition.types';

export const nutritionPlanService = {
  // Get all nutrition plans with pagination
  getAll: async (params?: PaginationParams): Promise<NutritionPlansResponse> => {
    const response = await api.get('/nutrition-plans', { params });
    return response.data;
  },

  // Get a single nutrition plan by ID
  getById: async (id: string): Promise<NutritionPlan> => {
    const response = await api.get(`/nutrition-plans/${id}`);
    return response.data;
  },

  // Create a new nutrition plan
  create: async (data: Partial<NutritionPlan>): Promise<NutritionPlan> => {
    const response = await api.post('/nutrition-plans', data);
    return response.data;
  },

  // Update a nutrition plan (backend uses PATCH)
  update: async (id: string, data: Partial<NutritionPlan>): Promise<NutritionPlan> => {
    const response = await api.patch(`/nutrition-plans/${id}`, data);
    return response.data;
  },

  // Delete a nutrition plan
  deletePlan: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/nutrition-plans/${id}`);
    return response.data;
  },

  // Share nutrition plan with users (simple share without deep clone)
  share: async (planId: string, userIds: string[]): Promise<NutritionPlan> => {
    const response = await api.post(`/nutrition-plans/${planId}/share`, { userIds });
    return response.data;
  },

  // Revoke share access
  revokeShare: async (planId: string, userId: string): Promise<NutritionPlan> => {
    const response = await api.delete(`/nutrition-plans/${planId}/share/${userId}`);
    return response.data;
  },

  // Get plans by user ID
  getByUserId: async (userId: string): Promise<NutritionPlan[]> => {
    const response = await api.get(`/nutrition-plans/user/${userId}`);
    return response.data;
  },

  // Get plans with shared access for a user
  getByUserWithShared: async (userId: string): Promise<NutritionPlan[]> => {
    const response = await api.get(`/nutrition-plans/user/${userId}/with-shared`);
    return response.data;
  },

  // Add rating to a nutrition plan
  addRating: async (planId: string, rating: number, comment?: string): Promise<NutritionPlan> => {
    const response = await api.post(`/nutrition-plans/${planId}/ratings`, { rating, comment });
    return response.data;
  },

  // Share nutrition plan (with access level)
  shareWithAccess: async (
    planId: string,
    data: { userId: string; accessLevel: string }
  ): Promise<NutritionPlan> => {
    const response = await api.post(`/share/nutrition-plan`, {
      planId,
      ...data,
    });
    return response.data;
  },

  // Activate a nutrition plan for the current user
  activate: async (planId: string): Promise<NutritionPlan> => {
    const response = await api.post(`/nutrition-plans/${planId}/activate`);
    return response.data;
  },
};

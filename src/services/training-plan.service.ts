import api from './api';

export interface TrainingPlan {
  _id?: string;
  name: string;
  description?: string;
  exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const trainingPlanService = {
  // Get all training plans with pagination
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<TrainingPlan>> => {
    const response = await api.get('/training-plans', { params });
    return response.data;
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
    const response = await api.patch(`/training-plans/${id}`, data);
    return response.data;
  },

  // Delete a training plan
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/training-plans/${id}`);
    return response.data;
  },
};
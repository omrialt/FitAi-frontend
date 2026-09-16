/**
 * Physical Target API Service
 */

import api from './api';
import type {
  PhysicalTarget,
  CreatePhysicalTargetDto,
  UpdatePhysicalTargetDto,
  TargetProgress,
} from '../types/physical-target.types';

export const physicalTargetService = {
  // Get targets for a user, optionally filtered by status
  getByUserId: async (userId: string, status?: string): Promise<PhysicalTarget[]> => {
    const response = await api.get(`/physical-targets/user/${userId}`, {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  // Get progress of the user's active targets against their latest physical data
  getProgress: async (userId: string): Promise<TargetProgress[]> => {
    const response = await api.get(`/physical-targets/user/${userId}/progress`);
    return response.data.data;
  },

  // Get single target by ID
  getById: async (id: string): Promise<PhysicalTarget> => {
    const response = await api.get(`/physical-targets/${id}`);
    return response.data.data;
  },

  // Create new target
  create: async (data: CreatePhysicalTargetDto): Promise<PhysicalTarget> => {
    const response = await api.post('/physical-targets', data);
    return response.data.data;
  },

  // Update target
  update: async (id: string, data: UpdatePhysicalTargetDto): Promise<PhysicalTarget> => {
    const response = await api.patch(`/physical-targets/${id}`, data);
    return response.data.data;
  },

  // Delete target
  delete: async (id: string): Promise<void> => {
    await api.delete(`/physical-targets/${id}`);
  },
};

export default physicalTargetService;

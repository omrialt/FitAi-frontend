import api from './api';
import type {
  CurrentStatus,
  UpdateCurrentStatusDto,
  SetActiveTrainingPlanDto,
  SetActiveMenuDto,
  SetPhaseDto,
} from '../types/current-status.types';

export const currentStatusService = {
  // Get current status by user ID
  getByUserId: async (userId: string): Promise<CurrentStatus> => {
    const response = await api.get(`/status/${userId}`);
    return response.data;
  },

  // Update current status
  update: async (userId: string, data: UpdateCurrentStatusDto): Promise<CurrentStatus> => {
    const response = await api.patch(`/status/${userId}`, data);
    return response.data;
  },

  // Set active training plan
  setActiveTrainingPlan: async (userId: string, data: SetActiveTrainingPlanDto): Promise<CurrentStatus> => {
    const response = await api.patch(`/status/${userId}/plan`, data);
    return response.data;
  },

  // Set active menu
  setActiveMenu: async (userId: string, data: SetActiveMenuDto): Promise<CurrentStatus> => {
    const response = await api.patch(`/status/${userId}/menu`, data);
    return response.data;
  },

  // Set phase
  setPhase: async (userId: string, data: SetPhaseDto): Promise<CurrentStatus> => {
    const response = await api.patch(`/status/${userId}/phase`, data);
    return response.data;
  },

  // Mark workout as completed
  markWorkoutCompleted: async (userId: string): Promise<CurrentStatus> => {
    const response = await api.patch(`/status/${userId}/workout-completed`);
    return response.data;
  },
};

export default currentStatusService;

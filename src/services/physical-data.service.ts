/**
 * Physical Data API Service
 */

import api from './api';
import type { 
  PhysicalData, 
  CreatePhysicalDataDto, 
  UpdatePhysicalDataDto,
  WeightProgressData 
} from '../types/physical-data.types';

export const physicalDataService = {
  // Get all physical data records
  getAll: async (): Promise<PhysicalData[]> => {
    const response = await api.get('/physical-data');
    return response.data.data;
  },

  // Get physical data by user ID
  getByUserId: async (userId: string): Promise<PhysicalData[]> => {
    const response = await api.get(`/physical-data/user/${userId}`);
    return response.data.data;
  },

  // Get latest physical data for user
  getLatestByUserId: async (userId: string): Promise<PhysicalData | null> => {
    const response = await api.get(`/physical-data/user/${userId}/latest`);
    return response.data.data;
  },

  // Get weight progress
  getWeightProgress: async (userId: string): Promise<WeightProgressData> => {
    const response = await api.get(`/physical-data/user/${userId}/progress`);
    return response.data.data;
  },

  // Calculate BMI
  calculateBMI: async (userId: string): Promise<{ bmi: number; category: string }> => {
    const response = await api.get(`/physical-data/user/${userId}/bmi`);
    return response.data.data || response.data;
  },

  // Get single record by ID
  getById: async (id: string): Promise<PhysicalData> => {
    const response = await api.get(`/physical-data/${id}`);
    return response.data.data;
  },

  // Create new physical data record
  create: async (data: CreatePhysicalDataDto): Promise<PhysicalData> => {
    const response = await api.post('/physical-data', data);
    return response.data.data;
  },

  // Update physical data record
  update: async (id: string, data: UpdatePhysicalDataDto): Promise<PhysicalData> => {
    const response = await api.patch(`/physical-data/${id}`, data);
    return response.data.data;
  },

  // Delete physical data record
  delete: async (id: string): Promise<void> => {
    await api.delete(`/physical-data/${id}`);
  },
};

export default physicalDataService;

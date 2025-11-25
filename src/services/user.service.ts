import api from './api';
import type { User } from '../types/auth.types';
import type { UpdateProfileDto, CreateUserDto } from '../types/user.types';

class UserService {
  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    const response = await api.get<{ data: User[] }>('/users');
    return response.data.data;
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  }

  /**
   * Update user profile
   */
  async update(id: string, data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Delete user
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    // Assumes current user ID is stored in auth state
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  }
}

export default new UserService();

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
   * Get user by ID.
   *
   * Every response is wrapped as `{ data, timestamp, path }` by the backend's
   * TransformInterceptor, so the user is at `response.data.data`. These methods
   * returned the envelope while their signatures promised a `User`, which
   * TypeScript could not catch because the cast said otherwise. The visible
   * effect was a blank creator name on the plan detail pages and a profile save
   * that never updated the store — every field read back as `undefined`.
   */
  async findOne(id: string): Promise<User> {
    const response = await api.get<{ data: User }>(`/users/${id}`);
    return response.data.data;
  }

  /**
   * Create new user
   */
  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<{ data: User }>('/users', data);
    return response.data.data;
  }

  /**
   * Update user profile
   */
  async update(id: string, data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<{ data: User }>(`/users/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete user
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  /**
   * Get the signed-in user's own profile.
   *
   * `/users/me` resolves from the access token, so nothing here has to know
   * the id — which is what the paired `updateProfile` below always assumed.
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/users/me');
    return response.data.data;
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await api.patch<{ data: User }>('/users/me', data);
    return response.data.data;
  }
}

export default new UserService();

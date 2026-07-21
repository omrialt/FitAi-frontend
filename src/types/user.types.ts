import type { User } from './auth.types';

export type { User };

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  target?: 'maintain' | 'cut' | 'bulk';
  isActive?: boolean;
  password?: string;
  avatarUrl?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  authProvider?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  height?: number;
  target?: 'maintain' | 'cut' | 'bulk';
}

export interface UserResponse {
  user: User;
  message?: string;
}

export type { User } from './auth.types';

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
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
}

export interface UserResponse {
  user: User;
  message?: string;
}

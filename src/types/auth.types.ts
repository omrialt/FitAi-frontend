/**
 * Authentication types for the fitness application
 */

export type UserRole = 'admin' | 'trainer' | 'user';

export type Gender = 'male' | 'female' | 'other';

export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  gender: Gender;
  birthDate: string;
  height?: number;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  height?: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

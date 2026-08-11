import { API_URL } from '../config/env';
import api from './api';
import type { User, AuthTokens, LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('fitai-auth-storage');
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
    return response.data;
  }

  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle(): void {
    // Get the API base URL from environment or default
    const apiUrl = API_URL;
    
    // Redirect to Google OAuth endpoint
    window.location.href = `${apiUrl}/auth/google`;
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google/callback', { code });
    return response.data;
  }

  /**
   * Trade the single-use code from the Google redirect for a session.
   *
   * The backend used to hand the browser accessToken, refreshToken and the
   * whole user object as query parameters, which put a working login into
   * browser history and into the Referer of the next request. It now sends one
   * opaque code and we POST it back here.
   */
  async exchangeGoogleCode(
    code: string,
  ): Promise<{ user: User; tokens: AuthTokens; needsProfile: boolean }> {
    const response = await api.post<{
      data?: { user: User; tokens: AuthTokens; needsProfile: boolean };
      user?: User;
      tokens?: AuthTokens;
      needsProfile?: boolean;
    }>('/auth/google/exchange', { code });

    // Responses are wrapped in `data` by the transform interceptor on most
    // routes but not all; accept either shape rather than guessing.
    const payload = response.data.data ?? response.data;

    if (!payload?.user || !payload?.tokens) {
      throw new Error('Malformed exchange response');
    }

    return {
      user: payload.user,
      tokens: payload.tokens,
      needsProfile: payload.needsProfile ?? false,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  }

  /**
   * Complete profile for OAuth users
   */
  async completeProfile(data: {
    fullName: string;
    gender: 'male' | 'female' | 'other';
    birthDate: string;
    role: 'user' | 'trainer';
    height?: number;
  }): Promise<AuthResponse> {
    const response = await api.patch<AuthResponse>('/auth/complete-profile', data);
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  }
}

export const authService = new AuthService();

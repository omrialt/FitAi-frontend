/**
 * useAuth Hook
 * 
 * Manages authentication, tokens, user info, role-based access, and redirects unauthorized users.
 * Integrates with Zustand store and axios interceptors.
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { user, login, logout, isAuthenticated, isLoading } = useAuth();
 * 
 *   const handleLogin = async (email: string, password: string) => {
 *     await login({ email, password });
 *   };
 * 
 *   if (isLoading) return <Loader />;
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 * 
 *   return <div>Welcome, {user?.fullName}</div>;
 * }
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import i18n from '../i18n';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, RegisterData, User, AuthTokens, UseAuthReturn } from '../types/auth.types';
import api from '../services/api';

/** Sent by the backend when the password was right but the address is unverified. */
export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED';

/**
 * Pull the machine-readable `code` out of an API error, if there is one.
 *
 * Branching on the human message would break the moment it is reworded or
 * translated, which is exactly why the backend sends a code alongside it.
 */
export function errorCode(error: unknown): string | null {
  const data = (
    error as { response?: { data?: { code?: unknown } } } | null
  )?.response?.data;

  return typeof data?.code === 'string' ? data.code : null;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    user, 
    tokens, 
    isAuthenticated, 
    login: setAuth, 
    logout: clearAuth,
    updateUser 
  } = useAuthStore();

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ data: { user: User; tokens: AuthTokens } }>('/auth/login', credentials);
      
      if (response.data.data.user && response.data.data.tokens) {
        setAuth(response.data.data.user, response.data.data.tokens);
        
        // Set axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.tokens.accessToken}`;
        
        toast.success(i18n.t('auth.welcomeBackName', { name: response.data.data.user.fullName }));
        navigate('/');
      }
    } catch (error: unknown) {
      // An unverified account is not a failed login — the password was
      // right. The caller renders a "check your inbox" panel with a resend
      // button, so this path must not shout a generic error over it.
      if (errorCode(error) === EMAIL_NOT_VERIFIED) {
        throw error;
      }

      const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : i18n.t('auth.loginFailed');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setAuth]);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.post<{
        data: { user: User; tokens?: AuthTokens; requiresVerification?: boolean };
      }>('/auth/register', data);

      const { user: newUser, tokens } = response.data.data;

      // Registration no longer returns tokens: the account exists but cannot
      // be used until the address is verified. The `tokens` branch is kept so
      // this works against a backend that has not been deployed yet — the two
      // repos deploy separately.
      if (newUser && tokens) {
        setAuth(newUser, tokens);

        // Set axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

        toast.success(i18n.t('auth.welcomeToFitAI', { name: newUser.fullName }));
        navigate('/');
        return;
      }

      if (newUser) {
        toast.success(i18n.t('auth.verificationSent', { email: newUser.email }));
        navigate('/login', { state: { awaitingVerification: newUser.email } });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : i18n.t('auth.registerFailed');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setAuth]);

  // Logout function
  const logout = useCallback(async () => {
    await clearAuth();
    toast.info(i18n.t('auth.loggedOut'));
    navigate('/login');
  }, [clearAuth, navigate]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!tokens?.refreshToken) {
      logout();
      return;
    }

    try {
      const response = await api.post<{ tokens: AuthTokens }>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });
      
      if (response.data.tokens) {
        useAuthStore.getState().setTokens(response.data.tokens);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [tokens, logout]);

  // Update profile function
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user?._id) {
      toast.error(i18n.t('auth.notAuthenticated'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.patch<{ user: User }>(`/users/${user._id}`, data);
      
      if (response.data.user) {
        updateUser(response.data.user);
        toast.success(i18n.t('auth.profileUpdated'));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data
        ? String(error.response.data.message)
        : i18n.t('auth.profileUpdateFailed');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  // Set authorization header on mount if tokens exist
  useEffect(() => {
    if (tokens?.accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
  }, [tokens]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };
}

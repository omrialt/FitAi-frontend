/**
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '../types/auth.types';
import type { AuthStore } from '../types/store.types';
import api from '../services/api';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (tokens) => set({ tokens }),
      
      login: (user, tokens) => set({ 
        user, 
        tokens, 
        isAuthenticated: true 
      }),
      
      logout: async () => {
        try {
          // Send logout request to backend to blacklist the token
          await api.post('/auth/logout');
        } catch (error) {
          // Log error but continue with logout on client side
          console.error('Backend logout failed:', error);
        } finally {
          // Always clear local auth state
          set({ 
            user: null, 
            tokens: null, 
            isAuthenticated: false 
          });
          // Clear axios default header
          delete api.defaults.headers.common['Authorization'];
        }
      },
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'fitai-auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      // Add onRehydrateStorage to fix inconsistent state
      onRehydrateStorage: () => (state) => {
        // Ensure isAuthenticated matches the presence of user
        if (state && state.user === null) {
          state.isAuthenticated = false;
        } else if (state && state.user !== null) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

/**
 * React 19 Enhanced useAuth Hook
 * Demonstrates conditional context consumption with use() hook
 */

import { use, createContext } from 'react';
import type { User, AuthTokens } from '../types/auth.types';

// Auth context type
interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context (to be provided by AuthProvider)
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * React 19: Enhanced useAuth with conditional context consumption
 * Uses use() instead of useContext for better error handling
 */
export function useAuthContext() {
  // React 19: use() can be called conditionally (unlike useContext)
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}

/**
 * React 19: Hook that optionally uses auth context
 * Demonstrates conditional use() calls
 */
export function useOptionalAuth(required: boolean = false) {
  let context: AuthContextType | null = null;

  try {
    // React 19: use() can be called conditionally based on props/state
    if (required) {
      context = use(AuthContext);
    }
  } catch (error) {
    if (required) {
      throw error;
    }
  }

  return {
    isAuthAvailable: context !== null,
    auth: context,
  };
}

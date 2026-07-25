/**
 * Zustand store interface types for auth and UI stores
 */

import type { User, AuthTokens } from './auth.types';

export interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export interface PendingInvitesStore {
  /** Trainer invitations awaiting the current user's response. */
  count: number;

  // Actions
  setCount: (count: number) => void;
  refresh: () => Promise<void>;
  clear: () => void;
}

export interface UIStore {
  // Modals
  activeModal: string | null;
  modalData: unknown;

  // Sidebar
  isSidebarOpen: boolean;

  // Theme
  theme: 'light' | 'dark';

  // Loading states
  globalLoading: boolean;

  // Actions
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleTheme: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

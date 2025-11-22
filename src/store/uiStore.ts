/**
 * Zustand store for UI state management
 */

import { create } from 'zustand';

interface UIStore {
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

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  modalData: null,
  isSidebarOpen: true,
  theme: 'light',
  globalLoading: false,

  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

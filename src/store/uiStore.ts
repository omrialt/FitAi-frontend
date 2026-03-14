/**
 * Zustand store for UI state management
 */

import { create } from 'zustand';
import type { UIStore } from '../types/store.types';

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

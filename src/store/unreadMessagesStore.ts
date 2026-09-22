/**
 * Zustand store for the number of unread messages.
 *
 * Same reason as `pendingInvitesStore`: the badge lives in the nav (AppLayout)
 * and the thing that clears it lives on the messages page, two different
 * subtrees. Opening a thread has to drop the badge immediately rather than at
 * the next poll, or the user is told they have unread mail they are looking at.
 */

import { create } from 'zustand';
import type { UnreadMessagesStore } from '../types/store.types';
import messageService from '../services/message.service';

export const useUnreadMessagesStore = create<UnreadMessagesStore>((set) => ({
  count: 0,

  setCount: (count) => set({ count }),

  refresh: async () => {
    try {
      set({ count: await messageService.getUnreadCount() });
    } catch {
      // Non-critical: keep the last known count rather than flashing the badge
      // off on one failed request.
    }
  },

  clear: () => set({ count: 0 }),
}));

/**
 * Zustand store for the number of trainer invitations awaiting a response.
 *
 * This lives in a store rather than component state because the two places
 * that care about it sit in different subtrees: the badge in the header
 * (AppLayout) and the Accept/Decline controls (TrainerConnectionPanel, on the
 * Profile page). Accepting an invite has to clear the badge immediately.
 */

import { create } from 'zustand';
import type { PendingInvitesStore } from '../types/store.types';
import trainerConnectionService from '../services/trainer-connection.service';

export const usePendingInvitesStore = create<PendingInvitesStore>((set) => ({
  count: 0,

  setCount: (count) => set({ count }),

  refresh: async () => {
    try {
      const connections = await trainerConnectionService.getMyConnections();
      set({ count: connections.filter((c) => c.status === 'pending').length });
    } catch {
      // Non-critical: a failed fetch keeps the last known count rather than
      // flashing the badge off, and never surfaces an error to the user.
    }
  },

  clear: () => set({ count: 0 }),
}));

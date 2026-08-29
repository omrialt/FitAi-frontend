/**
 * Weekly AI review.
 *
 * The server decides whether this exists at all — no key, no feature — so the
 * client asks before it offers a button. Everything here is scoped to the
 * caller: there is no user id to pass, and therefore no way to ask for
 * someone else's review.
 */

import api from './api';

export const aiReviewService = {
  /** Whether the server has an API key configured. */
  getStatus: async (): Promise<{ enabled: boolean }> => {
    const response = await api.get('/ai-review/status');
    return response.data.data;
  },

  /** Generates a review for the signed-in user. */
  generateForMe: async (): Promise<{ created: boolean }> => {
    const response = await api.post('/ai-review/me');
    return response.data.data;
  },
};

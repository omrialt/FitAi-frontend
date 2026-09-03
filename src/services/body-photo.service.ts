/**
 * Progress photos.
 *
 * The URLs that come back are signed and minted per request. They are bearer
 * capabilities that do not expire on their own, so nothing here caches one
 * past the render that needed it — no localStorage, no store, no offline
 * queue. Re-fetch the list instead.
 */

import api from './api';
import type { BodyPhoto, PhotoVisibility } from '../types/body-photo.types';

export const bodyPhotoService = {
  /** The signed-in user's own timeline, private photos included. */
  listMine: async (): Promise<BodyPhoto[]> => {
    const response = await api.get('/body-photos');
    return response.data.data;
  },

  /**
   * A client's timeline, as their trainer — only what they explicitly shared.
   * An accepted connection alone returns an empty list.
   */
  listForClient: async (userId: string): Promise<BodyPhoto[]> => {
    const response = await api.get(`/body-photos/user/${userId}`);
    return response.data.data;
  },

  /**
   * Uploads a photo. There is deliberately no visibility argument: a new photo
   * is private, and sharing is a separate deliberate action.
   */
  upload: async (
    file: File,
    details: { pose?: string; weightKg?: number; note?: string; takenAt?: string } = {},
  ): Promise<BodyPhoto> => {
    const form = new FormData();
    form.append('file', file);
    for (const [key, value] of Object.entries(details)) {
      if (value !== undefined && value !== '') form.append(key, String(value));
    }

    const response = await api.post('/body-photos', form, {
      // Let the browser set the multipart boundary; the default JSON header
      // from the axios instance would make this unparseable server-side.
      headers: { 'Content-Type': undefined },
    });
    return response.data.data;
  },

  setVisibility: async (
    id: string,
    visibility: PhotoVisibility,
  ): Promise<BodyPhoto> => {
    const response = await api.patch(`/body-photos/${id}/visibility`, {
      visibility,
    });
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/body-photos/${id}`);
  },
};

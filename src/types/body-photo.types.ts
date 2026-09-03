export type PhotoPose = 'front' | 'side' | 'back' | 'other';

/**
 * `private` is the default and the only state an upload can produce. Sharing
 * with a trainer is a separate, explicit action on one photo — it is never
 * inherited from the trainer connection that already grants access to
 * measurements, plans and the workout log.
 */
export type PhotoVisibility = 'private' | 'trainer';

export interface BodyPhoto {
  id: string;
  /**
   * A signed URL minted by the server for this request. It is a bearer
   * capability and does not expire on its own, so it is never persisted
   * anywhere on the client either.
   */
  url: string;
  pose: PhotoPose;
  visibility: PhotoVisibility;
  weightKg: number | null;
  note: string | null;
  takenAt: string;
  width: number | null;
  height: number | null;
}

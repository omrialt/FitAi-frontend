import api from './api';

export interface TrainerNote {
  _id: string;
  trainerId: string;
  clientId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The trainer's private note about one client. There is no client-side
 * counterpart to this service on purpose — the person the note is about has no
 * route to it.
 */
class TrainerNoteService {
  /** `null` when nothing has been written yet — not an empty note. */
  async get(clientId: string): Promise<TrainerNote | null> {
    const res = await api.get<{ data: TrainerNote | null }>(
      `/trainer-notes/${clientId}`,
    );
    return res.data.data;
  }

  async save(clientId: string, body: string): Promise<TrainerNote> {
    const res = await api.put<{ data: TrainerNote }>(
      `/trainer-notes/${clientId}`,
      { body },
    );
    return res.data.data;
  }
}

export const trainerNoteService = new TrainerNoteService();
export default trainerNoteService;

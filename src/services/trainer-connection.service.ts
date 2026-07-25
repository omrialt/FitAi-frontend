import api from './api';
import type { TrainerConnection } from '../types/trainer-connection.types';

// Backend wraps every response as { data, timestamp, path } (TransformInterceptor)
class TrainerConnectionService {
  /** Trainer invites a user to become their client. */
  async invite(clientId: string): Promise<TrainerConnection> {
    const res = await api.post<{ data: TrainerConnection }>(
      '/trainer-connections/invite',
      { clientId },
    );
    return res.data.data;
  }

  /** Trainer's roster: accepted clients + outstanding invites (client populated). */
  async getClients(): Promise<TrainerConnection[]> {
    const res = await api.get<{ data: TrainerConnection[] }>(
      '/trainer-connections/clients',
    );
    return res.data.data;
  }

  /** Current user's invites received + accepted trainer (trainer populated). */
  async getMyConnections(): Promise<TrainerConnection[]> {
    const res = await api.get<{ data: TrainerConnection[] }>(
      '/trainer-connections/my-connections',
    );
    return res.data.data;
  }

  /** Client accepts a pending invite. */
  async accept(id: string): Promise<TrainerConnection> {
    const res = await api.patch<{ data: TrainerConnection }>(
      `/trainer-connections/${id}/accept`,
    );
    return res.data.data;
  }

  /** Client declines a pending invite. */
  async decline(id: string): Promise<TrainerConnection> {
    const res = await api.patch<{ data: TrainerConnection }>(
      `/trainer-connections/${id}/decline`,
    );
    return res.data.data;
  }

  /** Either party ends the connection. */
  async remove(id: string): Promise<void> {
    await api.delete(`/trainer-connections/${id}`);
  }
}

export default new TrainerConnectionService();

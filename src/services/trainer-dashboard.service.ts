import api from './api';
import type { TrainerDashboardRow } from '../types/trainer-dashboard.types';

// Backend wraps every response as { data, timestamp, path } (TransformInterceptor)
class TrainerDashboardService {
  /**
   * The caller's whole roster, already sorted worst-first by the server.
   * Takes no arguments on purpose — the roster is the caller's own accepted
   * connections, so there is nothing here for a client id to be swapped into.
   */
  async getOverview(): Promise<TrainerDashboardRow[]> {
    const res = await api.get<{ data: TrainerDashboardRow[] }>(
      '/trainer-dashboard',
    );
    return res.data.data;
  }
}

export const trainerDashboardService = new TrainerDashboardService();
export default trainerDashboardService;

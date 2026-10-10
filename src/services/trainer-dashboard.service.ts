import api from './api';
import type {
  TrainerAlertSettings,
  TrainerDashboardRow,
} from '../types/trainer-dashboard.types';

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

  /** The thresholds the roster is judged by — the defaults until changed. */
  async getSettings(): Promise<TrainerAlertSettings> {
    const res = await api.get<{ data: TrainerAlertSettings }>(
      '/trainer-dashboard/settings',
    );
    return res.data.data;
  }

  async saveSettings(
    settings: TrainerAlertSettings,
  ): Promise<TrainerAlertSettings> {
    const res = await api.put<{ data: TrainerAlertSettings }>(
      '/trainer-dashboard/settings',
      settings,
    );
    return res.data.data;
  }
}

export const trainerDashboardService = new TrainerDashboardService();
export default trainerDashboardService;

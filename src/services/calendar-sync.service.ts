import api from './api';
import type { CalendarEvent, GoogleCalendarStatus, SyncResult } from '../types/calendar.types';

export type { CalendarEvent, GoogleCalendarStatus, SyncResult };

class CalendarSyncService {
  /**
   * Get Google Calendar OAuth URL
   */
  async getGoogleAuthUrl(): Promise<string> {
    const response = await api.get<{ authUrl: string }>(
      '/calendar-sync/google/auth-url',
    );
    return response.data.authUrl;
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<{ message: string; connected: boolean }> {
    const response = await api.post<{ message: string; connected: boolean }>(
      '/calendar-sync/google/callback',
      { code },
    );
    return response.data;
  }

  /**
   * Get Google Calendar connection status
   */
  async getConnectionStatus(): Promise<GoogleCalendarStatus> {
    const response = await api.get<GoogleCalendarStatus>(
      '/calendar-sync/google/status',
    );
    return response.data;
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnectGoogle(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      '/calendar-sync/google/disconnect',
    );
    return response.data;
  }

  /**
   * Get weekly calendar view
   */
  async getWeeklyCalendar(weekStart?: Date): Promise<CalendarEvent[]> {
    const params = weekStart ? { weekStart: weekStart.toISOString() } : {};
    const response = await api.get<{ data: { events: any[] } }>(
      '/calendar-sync/weekly',
      { params },
    );

    // Parse date strings to Date objects
    return response.data.data.events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  }

  /**
   * Sync training plan to Google Calendar
   */
  async syncTrainingPlan(
    trainingPlanId: string,
    weekStart?: Date,
  ): Promise<SyncResult> {
    const body = {
      trainingPlanId,
      weekStart: weekStart?.toISOString(),
    };
    const response = await api.post<SyncResult>(
      '/calendar-sync/sync-training-plan',
      body,
    );
    return response.data;
  }
}

const calendarSyncService = new CalendarSyncService();
export default calendarSyncService;
export { calendarSyncService };

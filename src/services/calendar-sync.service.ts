import api from './api';
import type { CalendarEvent, GoogleCalendarStatus, SyncResult } from '../types/calendar.types';

export type { CalendarEvent, GoogleCalendarStatus, SyncResult };

class CalendarSyncService {
  /**
   * Get Google Calendar OAuth URL
   */
  async getGoogleAuthUrl(): Promise<string> {
    const response = await api.get<{ data: { authUrl: string } }>(
      '/calendar-sync/google/auth-url',
    );
    return response.data.data.authUrl;
  }

  /**
   * Get Google Calendar connection status
   */
  async getConnectionStatus(): Promise<GoogleCalendarStatus> {
    const response = await api.get<{ data: GoogleCalendarStatus }>(
      '/calendar-sync/google/status',
    );
    return response.data.data;
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnectGoogle(): Promise<{ message: string }> {
    const response = await api.post<{ data: { message: string } }>(
      '/calendar-sync/google/disconnect',
    );
    return response.data.data;
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

    // Parse date strings to Date objects, discarding any event we cannot place
    // on the calendar. `new Date(null)` is NOT NaN — it silently returns
    // 1970-01-01, so an event with a missing date used to be grouped under a
    // day that is never rendered and vanished without a trace. Checking the raw
    // value first is what makes such an event visible as a dropped event rather
    // than a silent one.
    return response.data.data.events
      .map((event) => {
        if (event.start == null || event.end == null) return null;
        const start = new Date(event.start);
        const end = new Date(event.end);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return null;
        }
        return { ...event, start, end } as CalendarEvent;
      })
      .filter((e): e is CalendarEvent => e !== null);
  }

  /**
   * Sync training plan to Google Calendar (full month)
   */
  async syncTrainingPlan(
    trainingPlanId: string,
    referenceDate?: Date,
  ): Promise<SyncResult> {
    const body = {
      trainingPlanId,
      referenceDate: referenceDate?.toISOString(),
    };
    const response = await api.post<{ data: SyncResult }>(
      '/calendar-sync/sync-training-plan',
      body,
    );
    return response.data.data;
  }
}

const calendarSyncService = new CalendarSyncService();
export default calendarSyncService;
export { calendarSyncService };

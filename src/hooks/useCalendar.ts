import { useState, useEffect, useCallback } from 'react';
import calendarSyncService from '../services/calendar-sync.service';
import type { CalendarEvent, GoogleCalendarStatus, SyncResult } from '../types/calendar.types';

/**
 * Hook for managing Google Calendar connection
 */
export function useGoogleCalendar() {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const statusData = await calendarSyncService.getConnectionStatus();
      setStatus(statusData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to check connection status');
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const authUrl = await calendarSyncService.getGoogleAuthUrl();
      // Redirect to Google OAuth - backend handles the callback
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google Calendar connection');
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      await calendarSyncService.disconnectGoogle();
      setStatus({ connected: false, hasRefreshToken: false });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Google Calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    loading,
    error,
    connect,
    disconnect,
    refetch: checkStatus,
  };
}

/**
 * Hook for managing weekly calendar data
 */
export function useWeeklyCalendar(weekStart?: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const calendarEvents = await calendarSyncService.getWeeklyCalendar(weekStart);
      setEvents(calendarEvents);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

/**
 * Hook for syncing training plan to Google Calendar
 */
export function useTrainingPlanSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);

  const syncPlan = useCallback(
    async (trainingPlanId: string, weekStart?: Date) => {
      try {
        setSyncing(true);
        const syncResult = await calendarSyncService.syncTrainingPlan(
          trainingPlanId,
          weekStart,
        );
        setResult(syncResult);
        setError(null);
        return syncResult;
      } catch (err: any) {
        setError(err.message || 'Failed to sync training plan');
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [],
  );

  return {
    syncPlan,
    syncing,
    error,
    result,
  };
}

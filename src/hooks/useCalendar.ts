import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Guards against out-of-order responses. Stepping to the next week and back
  // leaves several requests in flight at once, and they do NOT come back in the
  // order they were sent — measured spread on this API is roughly 0.9s to 2.5s.
  // Whichever resolved last used to win, so a late response for a *different*
  // week would overwrite the current one. Those events then fall outside the
  // rendered week's date keys and are dropped during grouping, emptying the
  // calendar a moment after it correctly populated. Only the newest request is
  // allowed to touch state.
  const latestRequestRef = useRef(0);

  const fetchEvents = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    const isStale = () => requestId !== latestRequestRef.current;

    try {
      setLoading(true);
      const calendarEvents = await calendarSyncService.getWeeklyCalendar(weekStart);
      if (isStale()) return;
      setEvents(calendarEvents);
      setError(null);
    } catch (err: any) {
      if (isStale()) return;
      setError(err.message || 'Failed to fetch calendar events');
      setEvents([]);
    } finally {
      // A superseded request must not clear the spinner the newer one is using
      if (!isStale()) setLoading(false);
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

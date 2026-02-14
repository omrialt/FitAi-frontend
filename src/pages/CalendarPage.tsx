import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import WeeklyCalendar from '../components/calendar/WeeklyCalendar';
import currentStatusService from '../services/current-status.service';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

/**
 * Extract a MongoDB ObjectId string from a value that could be:
 * - a plain string ID
 * - a populated Mongoose document (object with _id)
 * - an ObjectId-like object with toString()
 */
function extractId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    // Populated document: { _id: "abc123", name: "...", ... }
    const obj = value as Record<string, unknown>;
    if (obj._id) return extractId(obj._id);
    // ObjectId with $oid (EJSON format)
    if (obj.$oid && typeof obj.$oid === 'string') return obj.$oid;
  }
  // Last resort — only if it looks like a valid Mongo ObjectId
  const str = String(value);
  if (/^[a-f0-9]{24}$/i.test(str)) return str;
  return undefined;
}

const CalendarPage: React.FC = () => {
  const [activeTrainingPlanId, setActiveTrainingPlanId] = useState<string | undefined>();
  const [shouldAutoSync, setShouldAutoSync] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle Google Calendar connection result from backend redirect
  useEffect(() => {
    const connected = searchParams.get('calendar_connected');
    const error = searchParams.get('calendar_error');

    if (connected === 'true') {
      toast.success('Google Calendar connected successfully!');
      // Trigger auto-sync after connection
      setShouldAutoSync(true);
    } else if (error) {
      toast.error(`Failed to connect Google Calendar: ${error}`);
    }

    // Clean up query params
    if (connected || error) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    // Fetch the user's active training plan from current status
    const fetchActivePlan = async () => {
      if (!user?._id) return;
      
      try {
        const result = await currentStatusService.getByUserId(user._id);
        // Backend wraps responses in { data: ... } via TransformInterceptor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wrapped = result as any;
        const currentStatus = wrapped?.data ?? result;
        
        const planField = currentStatus?.activeTrainingPlanId;
        if (planField) {
          // Could be: a string ID, or a populated object with _id
          const planId = extractId(planField);
          if (planId) setActiveTrainingPlanId(planId);
        }
      } catch (error) {
        console.error('Failed to fetch active training plan:', error);
      }
    };

    fetchActivePlan();
  }, [user?._id]);

  const handleAutoSyncComplete = useCallback(() => {
    setShouldAutoSync(false);
  }, []);

  return (
    <AppLayout>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
            Training Calendar
          </h1>
          <p style={{ margin: 0, color: '#666' }}>
            View and manage your training schedule alongside your Google Calendar events
          </p>
        </div>

        <WeeklyCalendar
          activeTrainingPlanId={activeTrainingPlanId}
          autoSyncOnConnect={shouldAutoSync}
          onAutoSyncComplete={handleAutoSyncComplete}
        />
      </div>
    </AppLayout>
  );
};

export default CalendarPage;

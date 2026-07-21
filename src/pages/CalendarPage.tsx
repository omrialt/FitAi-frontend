import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import WeeklyCalendar from '../components/calendar/WeeklyCalendar';
import currentStatusService from '../services/current-status.service';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [activeTrainingPlanId, setActiveTrainingPlanId] = useState<string | undefined>();
  const [shouldAutoSync, setShouldAutoSync] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle Google Calendar connection result from backend redirect
  useEffect(() => {
    const connected = searchParams.get('calendar_connected');
    const error = searchParams.get('calendar_error');

    if (connected === 'true') {
      toast.success(t('calendar.connectedSuccess'));
      // Trigger auto-sync after connection
      setShouldAutoSync(true);
    } else if (error) {
      toast.error(t('calendar.connectFailed', { error }));
    }

    // Clean up query params
    if (connected || error) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

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
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2">
            {t('calendar.pageTitle')}
          </h1>
          <p className="text-on-surface-variant">{t('calendar.pageSubtitle')}</p>
        </header>

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

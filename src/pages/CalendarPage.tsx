import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import WeeklyCalendar from '../components/calendar/WeeklyCalendar';
import currentStatusService from '../services/current-status.service';
import { useAuthStore } from '../store/authStore';

const CalendarPage: React.FC = () => {
  const [activeTrainingPlanId, setActiveTrainingPlanId] = useState<string | undefined>();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Fetch the user's active training plan from current status
    const fetchActivePlan = async () => {
      if (!user?._id) return;
      
      try {
        const currentStatus = await currentStatusService.getByUserId(user._id);
        if (currentStatus.activeTrainingPlanId) {
          setActiveTrainingPlanId(currentStatus.activeTrainingPlanId);
        }
      } catch (error) {
        console.error('Failed to fetch active training plan:', error);
      }
    };

    fetchActivePlan();
  }, [user?._id]);

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

        <WeeklyCalendar activeTrainingPlanId={activeTrainingPlanId} />
      </div>
    </AppLayout>
  );
};

export default CalendarPage;

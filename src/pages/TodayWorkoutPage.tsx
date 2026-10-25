import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Center, Loader } from '@mantine/core';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { loadActivePlan } from '../services/active-plan';
import { todaysPlanDayIndex } from '../utils/planDay';
import type { TrainingPlan } from '../types/training-plan.types';

/**
 * `/workout/today`: wherever "today's workout" is asked for — the app
 * shortcut now, reminders and the widget later — this finds the active plan's
 * day for today's weekday and opens its logger. On a rest day, or with no
 * active plan, it says so on the dashboard instead of opening the wrong day.
 */
export default function TodayWorkoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?._id);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    void (async () => {
      let plan: TrainingPlan | null = null;
      try {
        plan = await loadActivePlan(userId);
      } catch {
        plan = null;
      }
      if (cancelled) return;

      if (!plan?._id) {
        toast.info(t('dashboard.noActiveTrainingPlan'));
        navigate('/', { replace: true });
        return;
      }

      const dayIndex = todaysPlanDayIndex(plan.days);
      if (dayIndex < 0) {
        toast.info(t('dashboard.restDay'));
        navigate('/', { replace: true });
        return;
      }

      navigate(`/workout/${plan._id}/${dayIndex}`, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, navigate, t]);

  return (
    <Center style={{ minHeight: '60vh' }} aria-busy="true">
      <Loader color="indigo" />
    </Center>
  );
}

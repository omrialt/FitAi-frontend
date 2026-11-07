/**
 * The two non-body tabs of the Progress screen (redesign, direction B).
 *
 * These cards used to sit on the dashboard, all at once. Today now answers
 * "what do I do now"; the history and analysis live here, one tab at a time,
 * so each is opened on purpose rather than scrolled past.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CoachChat,
  FatigueCard,
  QuickStatsCards,
  RecentRecommendations,
  TrainingRecordCard,
  WeeklyReviewButton,
} from '../dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import { coachService } from '../../services/coach.service';

function Skeletons({ count = 2 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label={t('dashboard.loading')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton h-40 w-full rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}

export function TrainingProgressTab({ userId }: { userId: string }) {
  const { loading, trainingPlans, nutritionPlans, progressStats, bmi, workoutStats, ready } = useDashboard();

  if (loading) return <Skeletons count={3} />;

  return (
    <div className="flex flex-col gap-6">
      {ready.workoutStats && <TrainingRecordCard stats={workoutStats} />}
      <FatigueCard userId={userId} />
      {ready.trainingPlans && ready.nutritionPlans && ready.progressStats && ready.bmi && (
        <QuickStatsCards
          trainingPlans={trainingPlans}
          nutritionPlans={nutritionPlans}
          progressStats={progressStats}
          bmi={bmi}
        />
      )}
    </div>
  );
}

export function InsightsProgressTab() {
  const { loading, aiRecommendations, ready, refetch } = useDashboard();
  const [coachEnabled, setCoachEnabled] = useState(false);

  // The chat is a paid feature the server can have switched off; ask first.
  useEffect(() => {
    let cancelled = false;
    coachService
      .getStatus()
      .then((s) => !cancelled && setCoachEnabled(s.chat))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeletons />;

  return (
    <div className="flex flex-col gap-6">
      {ready.aiRecommendations && (
        <RecentRecommendations
          recommendations={aiRecommendations}
          action={<WeeklyReviewButton onCreated={refetch} />}
        />
      )}
      <CoachChat enabled={coachEnabled} />
    </div>
  );
}

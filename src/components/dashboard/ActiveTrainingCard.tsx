import { Text, Group, Badge, Stack, Modal, ScrollArea } from '@mantine/core';
import { IconBarbell } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StitchIcon } from '../common/StitchIcon';
import type { TrainingPlan, Exercise } from '../../types/training-plan.types';
import type { ActiveTrainingCardProps } from '../../types/dashboard-components.types';
import { DaysSection } from '../trainings/details/DaysSection';
import { VideoModal } from '../trainings/details/VideoModal';
import { trainingPlanService } from '../../services/training-plan.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const difficultyColor: Record<string, string> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

export function ActiveTrainingCard({
  plan,
  currentStatus,
  onPlanUpdate,
}: ActiveTrainingCardProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [modalOpened, setModalOpened] = useState(false);
  const [videoModalOpened, setVideoModalOpened] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [localPlan, setLocalPlan] = useState<TrainingPlan | null>(plan);

  useEffect(() => {
    setLocalPlan(plan);
  }, [plan]);

  const handleVideoClick = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setVideoModalOpened(true);
  };

  const handleExerciseUpdate = async (dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => {
    if (!localPlan) return;

    const updatedDays = [...localPlan.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      exercises: [
        ...updatedDays[dayIndex].exercises.slice(0, exerciseIndex),
        updatedExercise,
        ...updatedDays[dayIndex].exercises.slice(exerciseIndex + 1),
      ],
    };

    try {
      await trainingPlanService.update(localPlan._id, { days: updatedDays });
      const updatedPlan = { ...localPlan, days: updatedDays };
      setLocalPlan(updatedPlan);
      onPlanUpdate?.(updatedPlan);
      toast.success(t('trainings.historyUpdated'));
    } catch {
      toast.error(t('trainings.historyUpdateFailed'));
    }
  };

  if (!plan) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <StitchIcon name="fitness_center" size={18} />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
            {t('dashboard.activeTrainingPlan')}
          </h3>
        </div>
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-on-surface-variant text-center">
            {t('dashboard.noActiveTrainingPlan')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/my-trainings')}
            className="bg-primary-gradient text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:scale-[1.02] transition-transform"
          >
            {t('dashboard.browseTrainingPlans')}
          </button>
        </div>
      </div>
    );
  }

  const nextWorkoutDate = currentStatus?.nextWorkoutDate
    ? new Date(currentStatus.nextWorkoutDate)
    : null;

  // Calculate active cycle week
  const activeCycleWeek = plan.startDate
    ? Math.max(1, Math.floor((Date.now() - new Date(plan.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1)
    : null;
  const cycleTotalWeeks = plan.rotationCycleLength
    ? Math.ceil(plan.rotationCycleLength / 7)
    : null;

  // Find today's training day by matching dayOfWeek. The index is what the
  // workout logger addresses, so resolve it here rather than re-deriving it
  // from the day object on the other side of a route change.
  const todayDow = new Date().getDay();
  const todayIndex = plan.days.findIndex((d) => d.dayOfWeek === todayDow);
  const dayIndex = todayIndex >= 0 ? todayIndex : 0;
  const todayDay = plan.days[dayIndex];
  const todayProtocol = todayDay?.exercises?.slice(0, 3) ?? [];

  return (
    <>
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary-gradient flex items-center justify-center text-white shrink-0">
            <StitchIcon name="fitness_center" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface truncate">
              {plan.title}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {activeCycleWeek
                ? cycleTotalWeeks
                  ? t('dashboard.activeCycleWeekOf', {
                      week: activeCycleWeek,
                      total: cycleTotalWeeks,
                    })
                  : t('dashboard.activeCycleWeek', { week: activeCycleWeek })
                : t(`trainings.${plan.difficulty}`, {
                    defaultValue: plan.difficulty,
                  })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpened(true)}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline shrink-0"
        >
          {t('dashboard.viewPlan')}
          <StitchIcon name="chevron_right" size={14} />
        </button>
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">
        {t('dashboard.todaysProtocol')}
      </p>

      {todayProtocol.length > 0 ? (
        <div className="space-y-2">
          {todayProtocol.map((ex, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low"
            >
              <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-sm font-bold text-on-surface flex-1 truncate">
                {ex.name}
              </span>
              <span className="text-xs text-on-surface-variant shrink-0">
                {t('dashboard.setsByReps', {
                  sets: ex.sets.length,
                  reps: ex.sets[0]?.targetReps ?? '?',
                })}
              </span>
            </div>
          ))}
          {todayDay && todayDay.exercises.length > 3 && (
            <p className="text-xs text-on-surface-variant pt-1">
              {t('dashboard.moreExercises', {
                count: todayDay.exercises.length - 3,
              })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant">{t('dashboard.restDay')}</p>
      )}

      {/* The entry point into the workout logger. Offered only when the day
          actually has exercises — starting a session on a rest day would open
          an empty form. */}
      {todayProtocol.length > 0 && (
        <button
          type="button"
          onClick={() => navigate(`/workout/${plan._id}/${dayIndex}`)}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-primary-gradient text-white px-5 py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
        >
          <StitchIcon name="play_arrow" size={16} />
          {t('workout.startSession')}
        </button>
      )}

      {nextWorkoutDate && (
        <p className="text-xs text-on-surface-variant mt-4">
          {t('dashboard.next')}{' '}
          <span className="font-bold text-primary">
            {nextWorkoutDate.toLocaleDateString(i18n.language, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </p>
      )}
    </div>

    {/* Plan Details Modal */}
    <Modal
      opened={modalOpened}
      onClose={() => setModalOpened(false)}
      title={
        <Group gap="xs">
          <IconBarbell size={18} color="var(--mantine-color-indigo-5)" />
          <Text fw={600} size="lg">{localPlan?.title}</Text>
          {localPlan && (
            <Badge color={difficultyColor[localPlan.difficulty] || 'gray'} size="sm">
              {t(`trainings.${localPlan.difficulty}`, { defaultValue: localPlan.difficulty })}
            </Badge>
          )}
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {localPlan && (
        <Stack gap="md">
          {localPlan.description && (
            <Text size="sm" c="dimmed">{localPlan.description}</Text>
          )}
          <DaysSection
            days={localPlan.days}
            onVideoClick={handleVideoClick}
            onExerciseUpdate={handleExerciseUpdate}
          />
        </Stack>
      )}
    </Modal>

    {/* Video Modal */}
    <VideoModal
      opened={videoModalOpened}
      onClose={() => setVideoModalOpened(false)}
      videoUrl={currentVideoUrl}
    />
  </>
  );
}

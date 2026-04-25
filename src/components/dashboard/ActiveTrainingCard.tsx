import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Divider,
  Modal,
  ScrollArea,
} from '@mantine/core';
import {
  IconBarbell,
  IconCalendar,
  IconChevronRight,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TrainingPlan, Exercise } from '../../types/training-plan.types';
import type { ActiveTrainingCardProps } from '../../types/dashboard-components.types';
import { DaysSection } from '../trainings/details/DaysSection';
import { VideoModal } from '../trainings/details/VideoModal';
import { trainingPlanService } from '../../services/training-plan.service';
import { toast } from 'sonner';

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
      toast.success('Exercise history updated');
    } catch {
      toast.error('Failed to update exercise history');
    }
  };

  if (!plan) {
    return (
      <Paper className="dashboard-card" radius="md" p="lg" withBorder>
        <Group gap="xs" mb="md">
          <IconBarbell size={20} color="var(--mantine-color-indigo-5)" />
          <Title order={4}>Active Training Plan</Title>
        </Group>
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            No active training plan selected.
          </Text>
          <Button
            variant="light"
            color="indigo"
            size="sm"
            onClick={() => navigate('/my-trainings')}
          >
            Browse Training Plans
          </Button>
        </Stack>
      </Paper>
    );
  }

  const totalExercises = plan.days.reduce(
    (sum, d) => sum + d.exercises.length,
    0,
  );

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

  // Find today's training day by matching dayOfWeek
  const todayDow = new Date().getDay();
  const todayDay = plan.days.find((d) => d.dayOfWeek === todayDow) || plan.days[0];
  const todayProtocol = todayDay?.exercises?.slice(0, 3) ?? [];

  return (
    <>
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconBarbell size={20} color="var(--mantine-color-indigo-5)" />
          <Title order={4}>Active Training Plan</Title>
        </Group>
        <Badge color={difficultyColor[plan.difficulty] || 'gray'} size="sm">
          {plan.difficulty}
        </Badge>
      </Group>

      <Text fw={600} size="lg" mb={4}>
        {plan.title}
      </Text>

      {activeCycleWeek && (
        <Group gap={4} mb="sm">
          <IconCalendar size={13} color="var(--mantine-color-indigo-5)" />
          <Text size="xs" c="dimmed">
            Active Cycle: Week {activeCycleWeek}
            {cycleTotalWeeks ? ` of ${cycleTotalWeeks}` : ''}
          </Text>
        </Group>
      )}

      <Divider mb="md" label="Today's Protocol" labelPosition="left" />

      {todayProtocol.length > 0 ? (
        <Stack gap={6} mb="md">
          {todayProtocol.map((ex, i) => (
            <Group key={i} gap="xs" wrap="nowrap">
              <Text size="xs" c="indigo" fw={700} w={18}>{i + 1}.</Text>
              <Text size="xs" fw={500} style={{ flex: 1 }}>{ex.name}</Text>
              <Text size="xs" c="dimmed">
                {ex.sets.length} Sets × {ex.sets[0]?.targetReps ?? '?'} Reps
              </Text>
            </Group>
          ))}
          {todayDay && todayDay.exercises.length > 3 && (
            <Text size="xs" c="dimmed">+{todayDay.exercises.length - 3} more exercises</Text>
          )}
        </Stack>
      ) : (
        <Text size="xs" c="dimmed" mb="md">Rest day — no exercises scheduled today.</Text>
      )}

      <Divider mb="md" />

      <Group justify="space-between">
        {nextWorkoutDate && (
          <Text size="xs" c="dimmed">
            Next:{' '}
            <Text span fw={600} c="indigo">
              {nextWorkoutDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </Text>
        )}
        <Button
          variant="subtle"
          color="indigo"
          size="xs"
          rightSection={<IconChevronRight size={14} />}
          onClick={() => setModalOpened(true)}
          ml="auto"
        >
          View Plan
        </Button>
      </Group>
    </Paper>

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
              {localPlan.difficulty}
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

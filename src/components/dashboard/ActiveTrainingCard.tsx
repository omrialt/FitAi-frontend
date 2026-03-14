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
  IconClock,
  IconFlame,
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
      <Text size="sm" c="dimmed" lineClamp={2} mb="md">
        {plan.description}
      </Text>

      <Group gap="lg" mb="md">
        <Group gap={4}>
          <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed">
            {plan.days.length} days
          </Text>
        </Group>
        <Group gap={4}>
          <IconBarbell size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed">
            {totalExercises} exercises
          </Text>
        </Group>
        {plan.estimatedDuration && (
          <Group gap={4}>
            <IconClock size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              ~{plan.estimatedDuration} min
            </Text>
          </Group>
        )}
        {plan.estimatedCalories && (
          <Group gap={4}>
            <IconFlame size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              ~{plan.estimatedCalories} kcal
            </Text>
          </Group>
        )}
      </Group>

      <Divider mb="md" />

      <Group justify="space-between">
        {nextWorkoutDate && (
          <Text size="xs" c="dimmed">
            Next workout:{' '}
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

import { Stack, Grid, TextInput, Select, ActionIcon, Group, Text, Button, Badge, NumberInput } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { Exercise } from '../../../types/training-plan.types';

interface ExerciseItemProps {
  exercise: Exercise;
  exerciseIndex: number;
  dayIndex: number;
  onRemove: () => void;
  updateExerciseField: (dayIndex: number, exerciseIndex: number, field: string, value: unknown) => void;
  addSet: (dayIndex: number, exerciseIndex: number) => void;
  removeSet: (dayIndex: number, exerciseIndex: number, setIndex: number) => void;
  updateSet: (dayIndex: number, exerciseIndex: number, setIndex: number, updates: Record<string, unknown>) => void;
}

export function ExerciseItem({ 
  exercise,
  exerciseIndex, 
  dayIndex, 
  onRemove, 
  updateExerciseField,
  addSet,
  removeSet,
  updateSet
}: ExerciseItemProps) {

  return (
    <Stack gap="xs" p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
      <Group justify="space-between">
        <Text size="xs" fw={500}>Exercise {exerciseIndex + 1}</Text>
        <ActionIcon size="xs" color="red" variant="subtle" onClick={onRemove}>
          <IconTrash size={12} />
        </ActionIcon>
      </Group>

      <Grid gutter="xs">
        <Grid.Col span={6}>
          <TextInput
            label="Name"
            value={exercise.name || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'name', e.currentTarget.value)}
            size="xs"
            required
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Muscle Group"
            value={exercise.muscleGroup || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'muscleGroup', e.currentTarget.value)}
            size="xs"
            required
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Type"
            data={[
              { value: 'regular', label: 'Regular' },
              { value: 'dropset', label: 'Dropset' },
              { value: 'superset', label: 'Superset' },
            ]}
            value={exercise.type || 'regular'}
            onChange={(value) => value && updateExerciseField(dayIndex, exerciseIndex, 'type', value)}
            size="xs"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Notes"
            value={exercise.notes || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'notes', e.currentTarget.value)}
            size="xs"
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Video URL"
            value={exercise.video || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'video', e.currentTarget.value)}
            size="xs"
            placeholder="https://..."
          />
        </Grid.Col>
      </Grid>

      <Group justify="space-between" mt="xs">
        <Text size="xs" c="dimmed">Sets ({exercise.sets.length})</Text>
        <Button size="xs" variant="subtle" onClick={() => addSet(dayIndex, exerciseIndex)}>
          Add Set
        </Button>
      </Group>

      {exercise.sets.map((set, setIndex: number) => (
        <Group key={setIndex} gap="xs">
          <Badge size="sm">{setIndex + 1}</Badge>
          <Text size="xs" c="dimmed" style={{ width: 40 }}>Reps:</Text>
          <NumberInput
            placeholder="Reps"
            value={set.targetReps}
            onChange={(value) => typeof value === 'number' && updateSet(dayIndex, exerciseIndex, setIndex, { targetReps: value })}
            size="xs"
            style={{ width: 80 }}
          />
          <Text size="xs" c="dimmed" style={{ width: 50 }}>Weight:</Text>
          <NumberInput
            placeholder="Weight"
            value={set.targetWeight}
            onChange={(value) => typeof value === 'number' && updateSet(dayIndex, exerciseIndex, setIndex, { targetWeight: value })}
            size="xs"
            style={{ width: 80 }}
          />
          <ActionIcon size="xs" color="red" variant="subtle" onClick={() => removeSet(dayIndex, exerciseIndex, setIndex)}>
            <IconTrash size={12} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
}

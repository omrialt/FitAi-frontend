import { Accordion, Stack, Grid, TextInput, Select, ActionIcon, Group, Text, Button } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import type { TrainingDay } from '../../../types/training-plan.types';
import { ExerciseItem } from './ExerciseItem';

interface TrainingDayItemProps {
  day: TrainingDay;
  dayIndex: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<TrainingDay>) => void;
  addExercise: (dayIndex: number) => void;
  removeExercise: (dayIndex: number, exerciseIndex: number) => void;
  updateExerciseField: (dayIndex: number, exerciseIndex: number, field: string, value: unknown) => void;
  addSet: (dayIndex: number, exerciseIndex: number) => void;
  removeSet: (dayIndex: number, exerciseIndex: number, setIndex: number) => void;
  updateSet: (dayIndex: number, exerciseIndex: number, setIndex: number, updates: Record<string, unknown>) => void;
}

export function TrainingDayItem({ 
  day, 
  dayIndex, 
  onRemove, 
  onUpdate, 
  addExercise,
  removeExercise,
  updateExerciseField,
  addSet,
  removeSet,
  updateSet
}: TrainingDayItemProps) {

  return (
    <Accordion.Item value={`day-${dayIndex}`}>
      <Accordion.Control>
        <Group justify="space-between">
          <Text>{day.dayName} - {day.exercises.length} exercises</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Grid gutter="xs">
            <Grid.Col span={8}>
              <TextInput
                label="Day Name"
                value={day.dayName}
                onChange={(e) => onUpdate({ dayName: e.currentTarget.value })}
                size="xs"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="Day of Week"
                value={day.dayOfWeek.toString()}
                onChange={(value) => value && onUpdate({ dayOfWeek: parseInt(value) })}
                data={[
                  { value: '0', label: 'Sunday' },
                  { value: '1', label: 'Monday' },
                  { value: '2', label: 'Tuesday' },
                  { value: '3', label: 'Wednesday' },
                  { value: '4', label: 'Thursday' },
                  { value: '5', label: 'Friday' },
                  { value: '6', label: 'Saturday' },
                ]}
                size="xs"
              />
            </Grid.Col>
            <Grid.Col span={1}>
              <ActionIcon color="red" variant="light" onClick={onRemove} mt={20}>
                <IconTrash size={16} />
              </ActionIcon>
            </Grid.Col>
          </Grid>

          <Group justify="space-between">
            <Text size="sm" fw={500}>Exercises</Text>
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={() => addExercise(dayIndex)}>
              Add Exercise
            </Button>
          </Group>

          {day.exercises.map((exercise, exIndex) => (
            <ExerciseItem
              key={exIndex}
              exercise={exercise}
              exerciseIndex={exIndex}
              dayIndex={dayIndex}
              onRemove={() => removeExercise(dayIndex, exIndex)}
              updateExerciseField={updateExerciseField}
              addSet={addSet}
              removeSet={removeSet}
              updateSet={updateSet}
            />
          ))}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

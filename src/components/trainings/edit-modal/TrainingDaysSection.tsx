import { Stack, Group, Text, Button, Accordion } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { TrainingDay } from '../../../types/training-plan.types';
import { TrainingDayItem } from './TrainingDayItem';
import type { TrainingDaysSectionProps } from '../../../types/trainings-components.types';

export function TrainingDaysSection({ 
  localDays,
  addDay,
  removeDay,
  duplicateDay,
  updateDay,
  addExercise,
  removeExercise,
  updateExerciseField,
  addSet,
  removeSet,
  updateSet
}: TrainingDaysSectionProps) {

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={500} size="sm">Training Days ({localDays.length})</Text>
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addDay}>
          Add Day
        </Button>
      </Group>

      <Accordion variant="contained">
        {localDays.map((day: TrainingDay, dayIndex: number) => (
          <TrainingDayItem
            key={dayIndex}
            day={day}
            dayIndex={dayIndex}
            onRemove={() => removeDay(dayIndex)}
            onDuplicate={() => duplicateDay(dayIndex)}
            onUpdate={(updates: Partial<TrainingDay>) => updateDay(dayIndex, updates)}
            addExercise={addExercise}
            removeExercise={removeExercise}
            updateExerciseField={updateExerciseField}
            addSet={addSet}
            removeSet={removeSet}
            updateSet={updateSet}
          />
        ))}
      </Accordion>
    </Stack>
  );
}

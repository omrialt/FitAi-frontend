import { Accordion, Stack, Grid, TextInput, Select, ActionIcon, Group, Text, Button } from '@mantine/core';
import { IconTrash, IconPlus, IconCopy } from '@tabler/icons-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';

import { ExerciseItem } from './ExerciseItem';
import type { TrainingDayItemProps } from '../../../types/trainings-components.types';

export function TrainingDayItem({ 
  day, 
  dayIndex, 
  onRemove, 
  onDuplicate, 
  onUpdate, 
  addExercise,
  removeExercise,
  updateExerciseField,
  addSet,
  removeSet,
  updateSet
}: TrainingDayItemProps) {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = day.exercises.findIndex((_, i) => `exercise-${dayIndex}-${i}` === active.id);
      const newIndex = day.exercises.findIndex((_, i) => `exercise-${dayIndex}-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newExercises = arrayMove(day.exercises, oldIndex, newIndex);
        onUpdate({ exercises: newExercises });
      }
    }
  };

  const exerciseIds = day.exercises.map((_, index) => `exercise-${dayIndex}-${index}`);

  return (
    <Accordion.Item value={`day-${dayIndex}`}>
      <Accordion.Control>
        <Group justify="space-between">
          <Text>{day.dayName} - {t('trainings.exerciseCount', { count: day.exercises.length })}</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Grid gutter="xs">
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput
                label={t('trainings.dayName')}
                value={day.dayName}
                onChange={(e) => onUpdate({ dayName: e.currentTarget.value })}
                size="xs"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
                label={t('trainings.dayOfWeek')}
                value={day.dayOfWeek.toString()}
                onChange={(value) => value && onUpdate({ dayOfWeek: parseInt(value) })}
                data={[0, 1, 2, 3, 4, 5, 6].map((d) => ({
                  value: d.toString(),
                  label: t(`common.weekday${d}`),
                }))}
                size="xs"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 1 }}>
              <Group gap="xs" mt={20}>
                <ActionIcon color="blue" variant="light" onClick={onDuplicate}>
                  <IconCopy size={16} />
                </ActionIcon>
                <ActionIcon color="red" variant="light" onClick={onRemove}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Grid.Col>
          </Grid>

          <Group justify="space-between">
            <Text size="sm" fw={500}>{t('trainings.exercises')}</Text>
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={() => addExercise(dayIndex)}>
              {t('trainings.addExercise')}
            </Button>
          </Group>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              {day.exercises.map((exercise, exIndex) => (
                <ExerciseItem
                  key={`exercise-${dayIndex}-${exIndex}`}
                  id={`exercise-${dayIndex}-${exIndex}`}
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
            </SortableContext>
          </DndContext>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

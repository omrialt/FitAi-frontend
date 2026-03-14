import { Accordion, Stack, Grid, TextInput, Select, ActionIcon, Group, Text, Button } from '@mantine/core';
import { IconTrash, IconPlus, IconCopy } from '@tabler/icons-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TrainingDay } from '../../../types/training-plan.types';
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
          <Text>{day.dayName} - {day.exercises.length} exercises</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Grid gutter="xs">
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput
                label="Day Name"
                value={day.dayName}
                onChange={(e) => onUpdate({ dayName: e.currentTarget.value })}
                size="xs"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
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
            <Text size="sm" fw={500}>Exercises</Text>
            <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={() => addExercise(dayIndex)}>
              Add Exercise
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

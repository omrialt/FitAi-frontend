import { Stack, Grid, TextInput, Select, ActionIcon, Group, Text, Button, Badge, NumberInput, Accordion, Box } from '@mantine/core';
import { IconTrash, IconGripVertical } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

import type { ExerciseItemProps } from '../../../types/trainings-components.types';

export function ExerciseItem({ 
  exercise,
  exerciseIndex, 
  dayIndex, 
  onRemove, 
  updateExerciseField,
  addSet,
  removeSet,
  updateSet,
  id
}: ExerciseItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Accordion variant="contained" defaultValue="opened">
        <Accordion.Item value="opened">
          <Accordion.Control>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <Box {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                  <IconGripVertical size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                </Box>
                <Text size="sm" fw={500}>
                  {exercise.name || t('trainings.exerciseDefault', { num: exerciseIndex + 1 })}
                </Text>
                <Badge size="sm" variant="light">{t('trainings.setCount', { count: exercise.sets.length })}</Badge>
              </Group>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <Group justify="flex-end">
                <ActionIcon size="sm" color="red" variant="subtle" onClick={onRemove}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

              <Grid gutter="xs">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('common.name')}
            value={exercise.name || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'name', e.currentTarget.value)}
            size="xs"
            required
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('trainings.muscleGroup')}
            value={exercise.muscleGroup || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'muscleGroup', e.currentTarget.value)}
            size="xs"
            required
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label={t('trainings.typeLabel')}
            data={[
              { value: 'regular', label: t('trainings.type_regular') },
              { value: 'dropset', label: t('trainings.type_dropset') },
              { value: 'superset', label: t('trainings.type_superset') },
            ]}
            value={exercise.type || 'regular'}
            onChange={(value) => value && updateExerciseField(dayIndex, exerciseIndex, 'type', value)}
            size="xs"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('trainings.notes')}
            value={exercise.notes || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'notes', e.currentTarget.value)}
            size="xs"
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label={t('trainings.videoUrl')}
            value={exercise.video || ''}
            onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'video', e.currentTarget.value)}
            size="xs"
            placeholder="https://..."
          />
        </Grid.Col>
              </Grid>

              <Group justify="space-between" mt="xs">
                <Text size="xs" c="dimmed">{t('trainings.sets')} ({exercise.sets.length})</Text>
                <Button size="xs" variant="subtle" onClick={() => addSet(dayIndex, exerciseIndex)}>
                  {t('trainings.addSet')}
                </Button>
              </Group>

              {exercise.sets.map((set, setIndex: number) => (
        <Stack key={setIndex} gap="xs" p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '4px' }}>
          <Group gap="xs" wrap="nowrap">
            <Badge size="sm">{t('trainings.set')} {setIndex + 1}</Badge>
            <ActionIcon size="xs" color="red" variant="subtle" onClick={() => removeSet(dayIndex, exerciseIndex, setIndex)} ml="auto">
              <IconTrash size={12} />
            </ActionIcon>
          </Group>
          <Group gap="xs" grow>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">{t('trainings.repsHeader')}</Text>
              <NumberInput
                placeholder={t('trainings.repsHeader')}
                value={set.targetReps}
                onChange={(value) => typeof value === 'number' && updateSet(dayIndex, exerciseIndex, setIndex, { targetReps: value })}
                size="xs"
              />
            </Stack>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">{t('trainings.weightKg')}</Text>
              <NumberInput
                placeholder={t('trainings.weight')}
                value={set.targetWeight}
                onChange={(value) => typeof value === 'number' && updateSet(dayIndex, exerciseIndex, setIndex, { targetWeight: value })}
                size="xs"
              />
            </Stack>
          </Group>
        </Stack>
      ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}

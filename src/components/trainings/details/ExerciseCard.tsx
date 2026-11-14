/**
 * ExerciseCard - Display individual exercise with sets table
 *
 * The table shows what the plan prescribes and nothing else. Performed sets
 * used to be editable here through a per-set "sets history" modal that wrote
 * back into the plan document; that was replaced by the workout log, which
 * records sessions in their own collection. Two writable records of the same
 * thing could only disagree, so this side is now read-only prescription and
 * /workout-history is the record of what actually happened.
 */

import { Card, Text, Group, Badge, Table, Box, Button } from '@mantine/core';
import { IconVideo } from '@tabler/icons-react';
import { Activity, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExerciseCardProps } from '../../../types/trainings-components.types';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { muscleLabel } from '../../workout/history/labels';

const exerciseTypeColors: Record<string, string> = {
  regular: 'blue',
  dropset: 'orange',
  superset: 'grape',
};

export function ExerciseCard({ exercise, exerciseNumber, onVideoClick }: ExerciseCardProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [setsOpen, setSetsOpen] = useState(false);

  // On a phone, three identical rows of "10 · 0 kg" were a 250px table per
  // exercise and ~2,500px to scroll through one day. When every set is the
  // same, one line says it all; the table stays a tap away. Desktop keeps the
  // table as it was.
  const first = exercise.sets[0];
  const uniform =
    !!first &&
    exercise.sets.every(
      (set) => set.targetReps === first.targetReps && set.targetWeight === first.targetWeight,
    );
  const compact = isMobile && uniform && !setsOpen;

  return (
    <Card shadow="sm" p="md" withBorder>
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group gap="md">
          <Text fw={600} size="md">
            {exerciseNumber}. <bdi>{exercise.name}</bdi>
          </Text>
          <Badge color={exerciseTypeColors[exercise.type]} size="sm">
            {t(`trainings.type_${exercise.type}`, { defaultValue: exercise.type })}
          </Badge>
          {exercise.muscleGroup && (
            <Badge variant="light" color="cyan" size="sm" tt="none">
              {muscleLabel(t, exercise.muscleGroup)}
            </Badge>
          )}
        </Group>
        {exercise.video && (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconVideo size={16} />}
            onClick={() => onVideoClick(exercise.video!)}
          >
            {t('trainings.watchVideo')}
          </Button>
        )}
      </Group>

      <Activity mode={exercise.notes ? "visible" : "hidden"}>
        <Text size="sm" c="dimmed" mb="sm">
          📝 {exercise.notes}
        </Text>
      </Activity>

      {compact && (
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Text fw={700} size="sm">
            {first.targetWeight > 0
              ? t('trainings.setsSummaryWeight', {
                  sets: exercise.sets.length,
                  reps: first.targetReps,
                  weight: first.targetWeight,
                })
              : t('trainings.setsSummary', { sets: exercise.sets.length, reps: first.targetReps })}
          </Text>
          <Button size="compact-sm" variant="subtle" onClick={() => setSetsOpen(true)}>
            {t('trainings.showSets')}
          </Button>
        </Group>
      )}

      <Activity mode={exercise.sets.length > 0 && !compact ? "visible" : "hidden"}>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('trainings.set')}</Table.Th>
                <Table.Th>{t('trainings.targetReps')}</Table.Th>
                <Table.Th>{t('trainings.targetWeight')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {exercise.sets.map((set, setIndex) => (
                <Table.Tr key={setIndex}>
                  <Table.Td>
                    <Text fw={500}>{setIndex + 1}</Text>
                  </Table.Td>
                  <Table.Td>{set.targetReps}</Table.Td>
                  {/* No target is "—", not "0 kg", which reads as a typo. */}
                  <Table.Td>
                    {set.targetWeight > 0 ? `${set.targetWeight} ${t('common.kg')}` : '—'}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        {isMobile && uniform && setsOpen && (
          <Button size="compact-sm" variant="subtle" mt="xs" onClick={() => setSetsOpen(false)}>
            {t('trainings.hideSets')}
          </Button>
        )}
      </Activity>

      <Activity mode={exercise.sets.length === 0 ? "visible" : "hidden"}>
        <Text c="dimmed" size="sm">
          {t('trainings.noSets')}
        </Text>
      </Activity>
    </Card>
  );
}

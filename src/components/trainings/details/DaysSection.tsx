/**
 * DaysSection - Display training days with exercises, sets, and reps
 */

import { Stack, Title, Text, Group, Badge, Accordion, SimpleGrid } from '@mantine/core';
import { Activity } from 'react';
import { useTranslation } from 'react-i18next';
import { ExerciseCard } from './ExerciseCard';
import type { DaysSectionProps } from '../../../types/trainings-components.types';

export function DaysSection({ days, onVideoClick, onExerciseUpdate }: DaysSectionProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="lg" mb="xl">
      <Title order={2}>{t('trainings.trainingDays')}</Title>

      <Activity mode={days.length === 0 ? "visible" : "hidden"}>
        <Text c="dimmed" size="sm" ta="center">
          {t('trainings.noDaysYet')}
        </Text>
      </Activity>

      <Activity mode={days.length > 0 ? "visible" : "hidden"}>
        <Accordion variant="contained" defaultValue={`day-0`}>
          {days.map((day, dayIndex) => {
            const dayName = day.dayOfWeek >= 0 && day.dayOfWeek <= 6
              ? t(`common.weekday${day.dayOfWeek}`)
              : t('trainings.dayDefault', { num: day.dayOfWeek });
            const totalExercises = day.exercises.length;
            const totalSets = day.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

            return (
              <Accordion.Item key={dayIndex} value={`day-${dayIndex}`}>
                <Accordion.Control>
                  <Group justify="space-between" wrap="wrap">
                    <Group gap="md">
                      <Text fw={600} size="lg">
                        {day.dayName} ({dayName})
                      </Text>
                      <Badge variant="light" color="blue">
                        {t('trainings.exerciseCount', { count: totalExercises })}
                      </Badge>
                      <Badge variant="light" color="grape">
                        {t('trainings.setCount', { count: totalSets })}
                      </Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Activity mode={day.exercises.length === 0 ? "visible" : "hidden"}>
                    <Text c="dimmed" size="sm" ta="center" py="md">
                      {t('trainings.noExercisesYet')}
                    </Text>
                  </Activity>

                  <Activity mode={day.exercises.length > 0 ? "visible" : "hidden"}>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                      {day.exercises.map((exercise, exIndex) => (
                        <ExerciseCard
                          key={exIndex}
                          exercise={exercise}
                          exerciseNumber={exIndex + 1}
                          onVideoClick={onVideoClick}
                          onExerciseUpdate={onExerciseUpdate ? (updatedExercise) => onExerciseUpdate(dayIndex, exIndex, updatedExercise) : undefined}
                        />
                      ))}
                    </SimpleGrid>
                  </Activity>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Activity>
    </Stack>
  );
}

/**
 * DaysSection - Display training days with exercises, sets, and reps
 */

import { Stack, Title, Text, Group, Badge, Accordion, SimpleGrid } from '@mantine/core';
import { Activity } from 'react';
import type { TrainingDay, Exercise } from '../../../types/training-plan.types';
import { ExerciseCard } from './ExerciseCard';

interface DaysSectionProps {
  days: TrainingDay[];
  onVideoClick: (videoUrl: string) => void;
  onExerciseUpdate?: (dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => void;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function DaysSection({ days, onVideoClick, onExerciseUpdate }: DaysSectionProps) {
  return (
    <Stack gap="lg" mb="xl">
      <Title order={2}>Training Days</Title>

      <Activity mode={days.length === 0 ? "visible" : "hidden"}>
        <Text c="dimmed" size="sm" ta="center">
          No training days added to this plan yet
        </Text>
      </Activity>

      <Activity mode={days.length > 0 ? "visible" : "hidden"}>
        <Accordion variant="contained" defaultValue={`day-0`}>
          {days.map((day, dayIndex) => {
            const dayName = dayNames[day.dayOfWeek] || `Day ${day.dayOfWeek}`;
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
                        {totalExercises} {totalExercises === 1 ? 'Exercise' : 'Exercises'}
                      </Badge>
                      <Badge variant="light" color="grape">
                        {totalSets} {totalSets === 1 ? 'Set' : 'Sets'}
                      </Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Activity mode={day.exercises.length === 0 ? "visible" : "hidden"}>
                    <Text c="dimmed" size="sm" ta="center" py="md">
                      No exercises added yet
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

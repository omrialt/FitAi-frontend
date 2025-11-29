/**
 * ExerciseCard - Display individual exercise with sets table
 */

import { Card, Text, Group, Badge, Table, Box, Button } from '@mantine/core';
import { IconVideo } from '@tabler/icons-react';
import type { Exercise } from '../../../types/training-plan.types';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  onVideoClick: (videoUrl: string) => void;
}

const exerciseTypeLabels: Record<string, string> = {
  regular: 'Regular',
  dropset: 'Dropset',
  superset: 'Superset',
};

const exerciseTypeColors: Record<string, string> = {
  regular: 'blue',
  dropset: 'orange',
  superset: 'grape',
};

export function ExerciseCard({ exercise, exerciseNumber, onVideoClick }: ExerciseCardProps) {
  return (
    <Card shadow="sm" p="md" withBorder>
      <Group justify="space-between" mb="md" wrap="wrap">
        <Group gap="md">
          <Text fw={600} size="md">
            {exerciseNumber}. {exercise.name}
          </Text>
          <Badge color={exerciseTypeColors[exercise.type]} size="sm">
            {exerciseTypeLabels[exercise.type]}
          </Badge>
          <Badge variant="light" color="cyan" size="sm">
            {exercise.muscleGroup}
          </Badge>
        </Group>
        {exercise.video && (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconVideo size={16} />}
            onClick={() => onVideoClick(exercise.video!)}
          >
            Watch Video
          </Button>
        )}
      </Group>

      {exercise.notes && (
        <Text size="sm" c="dimmed" mb="sm">
          📝 {exercise.notes}
        </Text>
      )}

      {exercise.sets.length > 0 ? (
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Set</Table.Th>
                <Table.Th>Target Reps</Table.Th>
                <Table.Th>Target Weight</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {exercise.sets.map((set, setIndex) => (
                <Table.Tr key={setIndex}>
                  <Table.Td>
                    <Text fw={500}>Set {setIndex + 1}</Text>
                  </Table.Td>
                  <Table.Td>{set.targetReps}</Table.Td>
                  <Table.Td>{set.targetWeight} kg</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      ) : (
        <Text c="dimmed" size="sm">
          No sets defined
        </Text>
      )}
    </Card>
  );
}

/**
 * ExerciseCard - Display individual exercise with sets table
 */

import { Card, Text, Group, Badge, Table, Box, Button } from '@mantine/core';
import { IconVideo, IconHistory, IconPlus } from '@tabler/icons-react';
import { useState, Activity } from 'react';
import type { Exercise, WeightHistoryEntry } from '../../../types/training-plan.types';
import { SetHistoryModal } from './SetHistoryModal';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  onVideoClick: (videoUrl: string) => void;
  onExerciseUpdate?: (updatedExercise: Exercise) => void;
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

export function ExerciseCard({ exercise, exerciseNumber, onVideoClick, onExerciseUpdate }: ExerciseCardProps) {
  const [historyModalOpened, setHistoryModalOpened] = useState(false);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);

  const handleHistoryClick = (setIndex: number) => {
    setSelectedSetIndex(setIndex);
    setHistoryModalOpened(true);
  };

  const handleHistoryChange = (newHistory: WeightHistoryEntry[], syncToAllSets: boolean = false) => {
    if (selectedSetIndex === null || !onExerciseUpdate) return;

    const updatedSets = [...exercise.sets];
    
    if (syncToAllSets) {
      // Add the new record to all sets
      const newRecord = newHistory[newHistory.length - 1]; // Get the last added record
      updatedSets.forEach((set, index) => {
        updatedSets[index] = {
          ...set,
          history: [...set.history, newRecord],
        };
      });
    } else {
      // Update only the selected set
      updatedSets[selectedSetIndex] = {
        ...updatedSets[selectedSetIndex],
        history: newHistory,
      };
    }

    const updatedExercise = {
      ...exercise,
      sets: updatedSets,
    };

    onExerciseUpdate(updatedExercise);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpened(false);
    setSelectedSetIndex(null);
  };

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

      <Activity mode={exercise.notes ? "visible" : "hidden"}>
        <Text size="sm" c="dimmed" mb="sm">
          📝 {exercise.notes}
        </Text>
      </Activity>

      <Activity mode={exercise.sets.length > 0 ? "visible" : "hidden"}>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Set</Table.Th>
                <Table.Th>Target Reps</Table.Th>
                <Table.Th>Target Weight</Table.Th>
                <Table.Th>Sets History</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {exercise.sets.map((set, setIndex) => (
                <Table.Tr key={setIndex}>
                  <Table.Td>
                    <Text fw={500}>{setIndex + 1}</Text>
                  </Table.Td>
                  <Table.Td>{set.targetReps}</Table.Td>
                  <Table.Td>{set.targetWeight} kg</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      color={set.history && set.history.length > 0 ? 'blue' : 'teal'}
                      leftSection={
                        set.history && set.history.length > 0 ? (
                          <IconHistory size={14} />
                        ) : (
                          <IconPlus size={14} />
                        )
                      }
                      onClick={() => handleHistoryClick(setIndex)}
                    >
                      {set.history && set.history.length > 0 ? 'Show' : 'Add'}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Activity>

      <Activity mode={exercise.sets.length === 0 ? "visible" : "hidden"}>
        <Text c="dimmed" size="sm">
          No sets defined
        </Text>
      </Activity>

      <Activity mode={selectedSetIndex !== null ? "visible" : "hidden"}>
        {selectedSetIndex !== null && (
          <SetHistoryModal
            opened={historyModalOpened}
            onClose={closeHistoryModal}
            history={exercise.sets[selectedSetIndex]?.history || []}
            onHistoryChange={handleHistoryChange}
            setNumber={selectedSetIndex + 1}
            exerciseName={exercise.name}
            targetWeight={exercise.sets[selectedSetIndex]?.targetWeight || 0}
            targetReps={exercise.sets[selectedSetIndex]?.targetReps || 0}
          />
        )}
      </Activity>
    </Card>
  );
}

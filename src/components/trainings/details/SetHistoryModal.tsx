/**
 * SetHistoryModal - Modal for viewing and managing set history
 */

import { Modal, Table, Button, Group, TextInput, Box, Text, ActionIcon, Stack, Checkbox } from '@mantine/core';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { useState, Activity } from 'react';
import { DateInput } from '@mantine/dates';
import type { WeightHistoryEntry } from '../../../types/training-plan.types';
import { SetHistoryChart } from './SetHistoryChart';
import type { SetHistoryModalProps } from '../../../types/trainings-components.types';

export function SetHistoryModal({
  opened,
  onClose,
  history,
  onHistoryChange,
  setNumber,
  exerciseName,
  targetWeight,
  targetReps,
}: SetHistoryModalProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [syncToAllSets, setSyncToAllSets] = useState(false);
  const [formData, setFormData] = useState<{ date: Date; weight: number; reps: number }>({
    date: new Date(),
    weight: history.length === 0 ? targetWeight : 0,
    reps: history.length === 0 ? targetReps : 0,
  });

  // Format date as dd/mm/yyyy for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAdd = () => {
    if (formData.weight > 0 && formData.reps > 0) {
      const newHistory = [...history, {
        date: formData.date.toISOString(),
        weight: formData.weight,
        reps: formData.reps,
      }];
      onHistoryChange(newHistory, syncToAllSets);
      setFormData({
        date: new Date(),
        weight: 0,
        reps: 0,
      });
      setIsAdding(false);
      setSyncToAllSets(false);
    }
  };

  const handleUpdate = (index: number) => {
    if (formData.weight > 0 && formData.reps > 0) {
      const newHistory = [...history];
      newHistory[index] = {
        date: formData.date.toISOString(),
        weight: formData.weight,
        reps: formData.reps,
      };
      onHistoryChange(newHistory, syncToAllSets);
      setEditingIndex(null);
      setSyncToAllSets(false);
      setFormData({
        date: new Date(),
        weight: 0,
        reps: 0,
      });
    }
  };

  const handleDelete = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    onHistoryChange(newHistory);
  };

  const startEdit = (index: number, entry: WeightHistoryEntry) => {
    setEditingIndex(index);
    setFormData({
      date: new Date(entry.date),
      weight: entry.weight,
      reps: entry.reps,
    });
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setFormData({
      date: new Date(),
      weight: history.length === 0 ? targetWeight : 0,
      reps: history.length === 0 ? targetReps : 0,
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setIsAdding(false);
    setSyncToAllSets(false);
    setFormData({
      date: new Date(),
      weight: 0,
      reps: 0,
    });
  };

  // Prepare chart data with target as baseline
  const chartData = [
    {
      date: 'Target',
      weight: targetWeight,
      reps: targetReps,
      isTarget: true,
    },
    ...history.map((entry) => ({
      date: formatDate(entry.date),
      weight: entry.weight,
      reps: entry.reps,
      isTarget: false,
    }))
  ].sort((a, b) => {
    if (a.isTarget) return -1;
    if (b.isTarget) return 1;
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          History - {exerciseName} (Set {setNumber})
        </Text>
      }
      size="lg"
    >
      <Stack gap="md">
        {/* Always show chart if there's target data */}
        <SetHistoryChart chartData={chartData} />

        {/* Table section */}
        <Box>
          <Text fw={500} size="sm" mb="xs">
            Records
          </Text>
          {/* Target record */}
          <Box mb="sm" p="sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Target:</Text>
              <Group gap="lg">
                <Text size="sm">{targetWeight} kg</Text>
                <Text size="sm">{targetReps} reps</Text>
              </Group>
            </Group>
          </Box>
        </Box>

        <Activity mode={history.length > 0 ? "visible" : "hidden"}>
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Weight (kg)</Table.Th>
                  <Table.Th>Reps</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedHistory.map((entry, index) => (
                  <>
                    <Table.Tr key={index}>
                      {editingIndex === index ? (
                        <>
                          <Table.Td>
                            <DateInput
                              placeholder="Pick date"
                              value={formData.date}
                              onChange={(date) => setFormData({ ...formData, date: date ? (typeof date === 'string' ? new Date(date) : date) : new Date() })}
                              maxDate={new Date()}
                              size="xs"
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              type="number"
                              value={formData.weight}
                              onChange={(e) =>
                                setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
                              }
                              min={0}
                              step={0.5}
                              size="xs"
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              type="number"
                              value={formData.reps}
                              onChange={(e) =>
                                setFormData({ ...formData, reps: parseInt(e.target.value) || 0 })
                              }
                              min={1}
                              size="xs"
                            />
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <ActionIcon
                                color="blue"
                                onClick={() => handleUpdate(index)}
                                variant="light"
                                size="sm"
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                color="red"
                                onClick={cancelEdit}
                                variant="light"
                                size="sm"
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </>
                      ) : (
                        <>
                          <Table.Td>{formatDate(entry.date)}</Table.Td>
                        <Table.Td>{entry.weight} kg</Table.Td>
                        <Table.Td>{entry.reps}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              color="blue"
                              onClick={() => startEdit(index, entry)}
                              variant="light"
                              size="sm"
                              disabled={isAdding}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              color="red"
                              onClick={() => handleDelete(index)}
                              variant="light"
                              size="sm"
                              disabled={isAdding}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </>
                    )}
                    </Table.Tr>
                    {editingIndex === index && (
                      <Table.Tr>
                        <Table.Td colSpan={4}>
                          <Checkbox
                            label="Sync to all sets"
                            checked={syncToAllSets}
                            onChange={(e) => setSyncToAllSets(e.currentTarget.checked)}
                            size="xs"
                          />
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </>
                ))}
                <Activity mode={isAdding ? "visible" : "hidden"}>
                  <Table.Tr>
                    <Table.Td>
                      <DateInput
                        placeholder="Pick date"
                        value={formData.date}
                        onChange={(date) => setFormData({ ...formData, date: date ? (typeof date === 'string' ? new Date(date) : date) : new Date() })}
                        maxDate={new Date()}
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
                        }
                        min={0}
                        step={0.5}
                        size="xs"
                        placeholder="Weight"
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        type="number"
                        value={formData.reps}
                        onChange={(e) =>
                          setFormData({ ...formData, reps: parseInt(e.target.value) || 0 })
                        }
                        min={1}
                        size="xs"
                        placeholder="Reps"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          color="green"
                          onClick={handleAdd}
                          variant="light"
                          size="sm"
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={cancelEdit}
                          variant="light"
                          size="sm"
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Checkbox
                        label="Sync to all sets"
                        checked={syncToAllSets}
                        onChange={(e) => setSyncToAllSets(e.currentTarget.checked)}
                        size="xs"
                      />
                    </Table.Td>
                  </Table.Tr>
                </Activity>
              </Table.Tbody>
            </Table>
          </Box>
        </Activity>

        <Activity mode={history.length === 0 ? "visible" : "hidden"}>
          <Text c="dimmed" ta="center" py="md">
            No history recorded yet
          </Text>
        </Activity>

        <Activity mode={!isAdding && editingIndex === null ? "visible" : "hidden"}>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={startAdd}
            variant="light"
            fullWidth
          >
            Add Record
          </Button>
        </Activity>
      </Stack>
    </Modal>
  );
}

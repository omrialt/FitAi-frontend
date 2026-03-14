/**
 * MeasurementsTable - Table component displaying all physical data records
 */

import { Paper, Table, Title, ActionIcon, Group, Text, Stack, Badge, ScrollArea } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { PhysicalData } from '../../../../types/physical-data.types';
import { formatDate } from '../helpers/calcImprovement';
import { calcImprovement } from '../helpers/calcImprovement';
import { TableImprovementCell } from './TableImprovementCell';
import type { MeasurementsTableProps } from '../../../../types/physical-data-components.types';

export function MeasurementsTable({ data, onEdit, onDelete }: MeasurementsTableProps) {
  // Sort by date (newest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
  );

  if (data.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          No measurements recorded yet
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="lg" withBorder>
      <Stack gap="md">
        <Title order={3}>Measurement History</Title>
        
        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Weight (kg)</Table.Th>
                <Table.Th>Body Fat %</Table.Th>
                <Table.Th>Chest (cm)</Table.Th>
                <Table.Th>Waist (cm)</Table.Th>
                <Table.Th>Hips (cm)</Table.Th>
                <Table.Th>Arms (cm)</Table.Th>
                <Table.Th>Legs (cm)</Table.Th>
                <Table.Th>Improvement</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedData.map((record, index) => {
                // Get previous record for improvement calculation
                const previousRecord = index < sortedData.length - 1 ? sortedData[index + 1] : null;
                
                // Calculate improvements
                const weightImprovement = calcImprovement(record.weightKg, previousRecord?.weightKg, true);
                const bodyFatImprovement = calcImprovement(record.bodyFatPercent, previousRecord?.bodyFatPercent, true);

                return (
                  <Table.Tr key={record._id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {formatDate(record.dateRecorded)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{record.weightKg}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {record.bodyFatPercent ? `${record.bodyFatPercent}%` : '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {record.measurements?.chest || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {record.measurements?.waist || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {record.measurements?.hips || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {record.measurements?.arms || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {record.measurements?.legs || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Group gap={4}>
                          <Badge size="xs" variant="light" color="blue">W</Badge>
                          <TableImprovementCell value={weightImprovement} />
                        </Group>
                        {record.bodyFatPercent && (
                          <Group gap={4}>
                            <Badge size="xs" variant="light" color="green">BF</Badge>
                            <TableImprovementCell value={bodyFatImprovement} />
                          </Group>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => onEdit(record)}
                          title="Edit"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => onDelete(record)}
                          title="Delete"
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

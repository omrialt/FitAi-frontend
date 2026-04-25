/**
 * TrainingsFilters - Client Component
 * Filters section with status tabs, difficulty, target, and search
 */

'use client';

import { Group, Select, TextInput, Paper, Text, Button, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { TrainingFilters } from '../../types/training.types';
import type { TrainingsFiltersProps } from '../../types/trainings-components.types';

export function TrainingsFilters({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}: TrainingsFiltersProps) {
  const handleFilterChange = (key: keyof TrainingFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const statusFilter = (filters as any).status as string | undefined;
  const handleStatus = (val: string) => {
    onFiltersChange({ ...filters, ...(val ? { status: val } : { status: undefined }) } as any);
  };

  return (
    <Paper shadow="xs" p="md" radius="md" mb="lg">
      <Group gap="md" wrap="wrap" align="flex-end">
        {/* Search Input */}
        <Stack gap={4} style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">Plan Name</Text>
          <TextInput
            placeholder="Search plans..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </Stack>

        {/* Difficulty Filter */}
        <Stack gap={4} style={{ flex: '1 1 140px', minWidth: 130 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">Difficulty</Text>
          <Select
            placeholder="All Levels"
            data={[
              { value: '', label: 'All Levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'elite', label: 'Elite' },
            ]}
            value={filters.difficulty || ''}
            onChange={(value) => handleFilterChange('difficulty', value || undefined)}
            clearable
          />
        </Stack>

        {/* Target Filter */}
        <Stack gap={4} style={{ flex: '1 1 140px', minWidth: 130 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">Primary Target</Text>
          <Select
            placeholder="All Targets"
            data={[
              { value: '', label: 'All Targets' },
              { value: 'maintain', label: 'Maintain' },
              { value: 'cut', label: 'Cut' },
              { value: 'bulk', label: 'Bulk' },
            ]}
            value={filters.target || ''}
            onChange={(value) => handleFilterChange('target', value || undefined)}
            clearable
          />
        </Stack>

        {/* Active / Archived toggle */}
        <Group gap="xs" pb={1}>
          <Button
            variant={!statusFilter || statusFilter === 'active' ? 'filled' : 'outline'}
            color="indigo"
            size="sm"
            onClick={() => handleStatus('active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'archived' ? 'filled' : 'outline'}
            color="gray"
            size="sm"
            onClick={() => handleStatus('archived')}
          >
            Archived
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

/**
 * TrainingsFilters - Client Component
 * Filters section with status, creator, difficulty, date range, and search
 */

'use client';

import { Grid, Select, TextInput, Paper } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
import type { TrainingFilters } from '../../types/training.types';

interface TrainingsFiltersProps {
  filters: TrainingFilters;
  onFiltersChange: (filters: TrainingFilters) => void;
  onSearchChange: (search: string) => void;
}

export function TrainingsFilters({
  filters,
  onFiltersChange,
  onSearchChange,
}: TrainingsFiltersProps) {
  const handleFilterChange = (key: keyof TrainingFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <Paper shadow="xs" p="md" radius="md" mb="lg">
      <Grid gutter="md">
        {/* Search Input */}
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <TextInput
            placeholder="Search trainings..."
            leftSection={<IconSearch size={16} />}
            value={filters.search || ''}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </Grid.Col>

        {/* Status Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            placeholder="Status"
            data={[
              { value: '', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', value || undefined)}
            clearable
          />
        </Grid.Col>

        {/* Creator Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            placeholder="Creator"
            data={[
              { value: '', label: 'All Creators' },
              { value: 'me', label: 'Me' },
              { value: 'coach', label: 'Coach' },
              { value: 'system', label: 'System' },
            ]}
            value={filters.creator || ''}
            onChange={(value) => handleFilterChange('creator', value || undefined)}
            clearable
          />
        </Grid.Col>

        {/* Difficulty Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            placeholder="Difficulty"
            data={[
              { value: '', label: 'All Levels' },
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
            value={filters.difficulty || ''}
            onChange={(value) => handleFilterChange('difficulty', value || undefined)}
            clearable
          />
        </Grid.Col>

        {/* Date Range Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <DatePickerInput
            type="range"
            placeholder="Date range"
            value={[filters.dateFrom || null, filters.dateTo || null]}
            onChange={([from, to]) => {
              onFiltersChange({
                ...filters,
                dateFrom: from ? new Date(from) : undefined,
                dateTo: to ? new Date(to) : undefined,
              });
            }}
            clearable
          />
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

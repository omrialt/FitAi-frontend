/**
 * TrainingsFilters - Client Component
 * Filters section with status, creator, difficulty, date range, and search
 */

'use client';

import { Grid, Select, TextInput, Paper } from '@mantine/core';
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

  return (
    <Paper shadow="xs" p="md" radius="md" mb="lg">
      <Grid gutter="md">
        {/* Search Input */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <TextInput
            placeholder="Search trainings..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </Grid.Col>

        {/* Creator Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            placeholder="Creator"
            data={[
              { value: '', label: 'All Creators' },
              { value: 'me', label: 'Me' },
              { value: 'coach', label: 'Coach' },
            ]}
            value={filters.creator || ''}
            onChange={(value) => handleFilterChange('creator', value || undefined)}
            clearable
          />
        </Grid.Col>

        {/* Difficulty Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            placeholder="Difficulty"
            data={[
              { value: '', label: 'All Levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={filters.difficulty || ''}
            onChange={(value) => handleFilterChange('difficulty', value || undefined)}
            clearable
          />
        </Grid.Col>

        {/* Target Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            placeholder="Fitness Goal"
            data={[
              { value: '', label: 'All Goals' },
              { value: 'maintain', label: 'Maintain' },
              { value: 'cut', label: 'Cut' },
              { value: 'bulk', label: 'Bulk' },
            ]}
            value={filters.target || ''}
            onChange={(value) => handleFilterChange('target', value || undefined)}
            clearable
          />
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

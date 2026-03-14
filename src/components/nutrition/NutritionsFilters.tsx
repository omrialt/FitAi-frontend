/**
 * NutritionsFilters - Client Component
 * Filters section with search, target, rating, and calorie range
 */

'use client';

import { Grid, Select, TextInput, Paper, NumberInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { NutritionFilters } from '../../types/nutrition.types';
import type { NutritionsFiltersProps } from '../../types/nutrition-components.types';

export function NutritionsFilters({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}: NutritionsFiltersProps) {
  const handleFilterChange = (key: keyof NutritionFilters, value: string | number | undefined) => {
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
            placeholder="Search by title or creator..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </Grid.Col>

        {/* Target Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            placeholder="Goal"
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

        {/* Rating Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            placeholder="Min Rating"
            data={[
              { value: '', label: 'All Ratings' },
              { value: '1', label: '1+ Stars' },
              { value: '2', label: '2+ Stars' },
              { value: '3', label: '3+ Stars' },
              { value: '4', label: '4+ Stars' },
              { value: '5', label: '5 Stars' },
            ]}
            value={filters.minRating?.toString() || ''}
            onChange={(value) => handleFilterChange('minRating', value ? Number(value) : undefined)}
            clearable
          />
        </Grid.Col>

        {/* Min Calories Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <NumberInput
            placeholder="Min Calories"
            min={0}
            step={100}
            value={filters.minCalories || ''}
            onChange={(value) => handleFilterChange('minCalories', typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>

        {/* Max Calories Filter */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <NumberInput
            placeholder="Max Calories"
            min={0}
            step={100}
            value={filters.maxCalories || ''}
            onChange={(value) => handleFilterChange('maxCalories', typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

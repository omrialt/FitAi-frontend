/**
 * NutritionsFilters - Client Component
 * Filters section with search, target, and rating filters
 */

'use client';

import { Group, Select, TextInput, Paper, ActionIcon } from '@mantine/core';
import { IconSearch, IconAdjustments } from '@tabler/icons-react';
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
    <Paper
      shadow="xs"
      p="md"
      radius="xl"
      mb="lg"
      style={{ border: '1px solid var(--mantine-color-gray-2)' }}
    >
      <Group wrap="wrap" gap="md">
        {/* Search Input */}
        <TextInput
          placeholder="Filter by plan name..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          radius="md"
          style={{ flex: '1 1 240px' }}
        />

        {/* Target Filter */}
        <Select
          placeholder="Target: All"
          data={[
            { value: '', label: 'Target: All' },
            { value: 'cut', label: 'Weight Loss' },
            { value: 'bulk', label: 'Muscle Gain' },
            { value: 'maintain', label: 'Maintain' },
          ]}
          value={filters.target || ''}
          onChange={(value) => handleFilterChange('target', value || undefined)}
          radius="md"
          clearable
          style={{ minWidth: 140 }}
        />

        {/* Rating Filter */}
        <Select
          placeholder="Rating: Any"
          data={[
            { value: '', label: 'Rating: Any' },
            { value: '4', label: '4.0+ Stars' },
            { value: '4.5', label: '4.5+ Stars' },
            { value: '5', label: '5 Stars' },
          ]}
          value={filters.minRating?.toString() || ''}
          onChange={(value) => handleFilterChange('minRating', value ? Number(value) : undefined)}
          radius="md"
          clearable
          style={{ minWidth: 140 }}
        />

        {/* Advanced filters toggle */}
        <ActionIcon variant="subtle" color="gray" size="lg" radius="md">
          <IconAdjustments size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

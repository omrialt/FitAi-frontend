/**
 * TrainingsFilters - Client Component
 * Filters section with status tabs, difficulty, target, and search
 */

'use client';

import { Group, Select, TextInput, Paper, Text, SegmentedControl, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TrainingFilters } from '../../types/training.types';
import type { TrainingsFiltersProps } from '../../types/trainings-components.types';

export function TrainingsFilters({
  filters,
  onFiltersChange,
  search,
  onSearchChange,
}: TrainingsFiltersProps) {
  const { t } = useTranslation();
  const handleFilterChange = (key: keyof TrainingFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleStatus = (val: string) => {
    onFiltersChange({
      ...filters,
      status: val === 'archived' ? 'archived' : 'active',
    });
  };

  return (
    <Paper shadow="xs" p="md" radius="md" mb="lg">
      <Group gap="md" wrap="wrap" align="flex-end">
        {/* Search Input */}
        <Stack gap={4} style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">{t('trainings.planName')}</Text>
          <TextInput
            placeholder={t('trainings.searchPlaceholder')}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        </Stack>

        {/* Difficulty Filter */}
        <Stack gap={4} style={{ flex: '1 1 140px', minWidth: 130 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">{t('trainings.difficulty')}</Text>
          <Select
            placeholder={t('trainings.allLevels')}
            data={[
              { value: '', label: t('trainings.allLevels') },
              { value: 'beginner', label: t('trainings.beginner') },
              { value: 'intermediate', label: t('trainings.intermediate') },
              { value: 'advanced', label: t('trainings.advanced') },
              { value: 'elite', label: t('trainings.elite') },
            ]}
            value={filters.difficulty || ''}
            onChange={(value) => handleFilterChange('difficulty', value || undefined)}
            clearable
          />
        </Stack>

        {/* Target Filter */}
        <Stack gap={4} style={{ flex: '1 1 140px', minWidth: 130 }}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">{t('trainings.primaryTarget')}</Text>
          <Select
            placeholder={t('trainings.allTargets')}
            data={[
              { value: '', label: t('trainings.allTargets') },
              { value: 'maintain', label: t('trainings.maintain') },
              { value: 'cut', label: t('trainings.cut') },
              { value: 'bulk', label: t('trainings.bulk') },
            ]}
            value={filters.target || ''}
            onChange={(value) => handleFilterChange('target', value || undefined)}
            clearable
          />
        </Stack>

        {/* Active / Archived toggle */}
        <SegmentedControl
          value={filters.status === 'archived' ? 'archived' : 'active'}
          onChange={handleStatus}
          color="indigo"
          data={[
            { value: 'active', label: t('trainings.active') },
            { value: 'archived', label: t('trainings.archived') },
          ]}
        />
      </Group>
    </Paper>
  );
}

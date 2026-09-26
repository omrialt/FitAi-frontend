/**
 * PaginationControls - Pagination component
 */

import { Pagination, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { PaginationControlsProps } from '../../types/common.types';

export function PaginationControls({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  const { t } = useTranslation();
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  // An empty list already shows its empty state; "showing 1 to 0 of 0"
  // under it only contradicted it.
  if (total === 0) return null;

  return (
    <Group justify="space-between" mt="xl" gap="sm">
      <Text size="sm" c="dimmed">
        {t('common.showingResults', { start, end, total })}
      </Text>
      {totalPages > 1 && (
        <Pagination value={currentPage} onChange={onPageChange} total={totalPages} />
      )}
    </Group>
  );
}

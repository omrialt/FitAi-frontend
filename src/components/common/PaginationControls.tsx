/**
 * PaginationControls - Pagination component
 */

import { Pagination, Group, Text } from '@mantine/core';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationControlsProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <Group justify="space-between" mt="xl">
      <Text size="sm" c="dimmed">
        Showing {start} to {end} of {total} results
      </Text>
      <Pagination value={currentPage} onChange={onPageChange} total={totalPages} />
    </Group>
  );
}

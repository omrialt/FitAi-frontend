/**
 * TableImprovementCell - Cell component showing improvement percentage
 */

import { Text } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

interface TableImprovementCellProps {
  value: string;
}

export function TableImprovementCell({ value }: TableImprovementCellProps) {
  if (value === '—') {
    return <Text c="dimmed">{value}</Text>;
  }

  // Parse the percentage value
  const numericValue = parseFloat(value.replace('%', ''));
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;

  return (
    <Text 
      c={isPositive ? 'green' : isNegative ? 'red' : 'dimmed'}
      fw={500}
      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
    >
      {isPositive && <IconTrendingUp size={16} />}
      {isNegative && <IconTrendingDown size={16} />}
      {value}
    </Text>
  );
}

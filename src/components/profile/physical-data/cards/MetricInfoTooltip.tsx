/**
 * MetricInfoTooltip - Floating panel showing metric explanation and range visualization
 */

import { useState } from 'react';
import { Popover, ActionIcon, Stack, Text, Paper } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { RangeBar } from './RangeBar';
import type { RangeSegment } from '../helpers/calcRanges';

interface MetricInfoTooltipProps {
  metricName: string;
  explanation: string;
  ranges: RangeSegment[];
  userValue: number;
  unit?: string;
  iconColor?: string;
}

export function MetricInfoTooltip({
  metricName,
  explanation,
  ranges,
  userValue,
  unit = '',
  iconColor = 'var(--mantine-color-gray-6)',
}: MetricInfoTooltipProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      width={480}
      position="bottom"
      withArrow
      shadow="lg"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => setOpened((o) => !o)}
          style={{ cursor: 'pointer' }}
        >
          <IconInfoCircle size={16} style={{ color: iconColor }} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Paper p="lg">
          <Stack gap="lg">
            {/* Metric name */}
            <Text size="lg" fw={700}>
              {metricName}
            </Text>

            {/* Explanation */}
            <Text size="sm" c="dimmed">
              {explanation}
            </Text>

            {/* Range visualization */}
            <RangeBar ranges={ranges} userValue={userValue} unit={unit} />
          </Stack>
        </Paper>
      </Popover.Dropdown>
    </Popover>
  );
}

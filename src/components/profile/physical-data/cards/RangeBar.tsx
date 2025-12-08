/**
 * RangeBar - Visual bar showing health metric ranges with user position marker
 */

import { Box, Group, Stack, Text } from '@mantine/core';
import type { RangeSegment } from '../helpers/calcRanges';

interface RangeBarProps {
  ranges: RangeSegment[];
  userValue: number;
  unit?: string;
}

export function RangeBar({ ranges, userValue, unit = '' }: RangeBarProps) {
  // Calculate the total range span
  const minValue = ranges[0].min;
  const maxValue = ranges[ranges.length - 1].max;
  const totalRange = maxValue - minValue;

  // Calculate user position percentage (clamped between 0 and 100)
  const clampedValue = Math.max(minValue, Math.min(maxValue, userValue));
  const userPositionPercent = ((clampedValue - minValue) / totalRange) * 100;

  // Calculate each segment's width percentage based on visual continuity
  const segmentsWithWidth = ranges.map((segment, index) => {
    // For display purposes, make segments continuous
    const displayMin = segment.min;
    const displayMax = index < ranges.length - 1 ? ranges[index + 1].min : segment.max;
    const segmentRange = displayMax - displayMin;
    const widthPercent = (segmentRange / totalRange) * 100;
    return { ...segment, widthPercent };
  });

  return (
    <Stack gap="md">
      {/* Range labels with numbers */}
      <Stack gap="xs">
        {segmentsWithWidth.map((segment, index) => (
          <Group key={index} justify="space-between" gap="xs" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: segment.color,
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
              <Text size="sm" fw={500} style={{ fontSize: '12px' }}>
                {segment.label}
              </Text>
            </Group>
            <Text size="sm" c="dimmed" fw={500} style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
              {segment.min.toFixed(1)}{unit} - {index === segmentsWithWidth.length - 1 ? segment.max.toFixed(1) + '+' : segment.max.toFixed(1)}{unit}
            </Text>
          </Group>
        ))}
      </Stack>

      {/* Range bar with segments */}
      <Box style={{ position: 'relative', height: 50 }}>
        <Group gap={0} style={{ height: 35, borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {segmentsWithWidth.map((segment, index) => (
            <Box
              key={index}
              style={{
                width: `${segment.widthPercent}%`,
                height: '100%',
                backgroundColor: segment.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text 
                size="xs" 
                c="white" 
                fw={600} 
                style={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  fontSize: '9px',
                  display: segment.widthPercent < 8 ? 'none' : 'block'
                }}
              >
                {segment.label}
              </Text>
            </Box>
          ))}
        </Group>

        {/* User position marker */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: `${userPositionPercent}%`,
            transform: 'translateX(-50%)',
            height: 45,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Vertical line */}
          <Box
            style={{
              width: 3,
              height: 40,
              backgroundColor: '#000',
              borderRadius: 2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            }}
          />
          {/* Arrow tip */}
          <Box
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #000',
              marginTop: -1,
            }}
          />
        </Box>
      </Box>

      {/* User value label */}
      <Text size="md" fw={700} ta="center" c="dark" style={{ marginTop: 4 }}>
        You are here: {userValue.toFixed(1)}{unit}
      </Text>
    </Stack>
  );
}

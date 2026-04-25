/**
 * LatestRecordCard - Card displaying the latest physical data measurement
 */

import { Paper, Stack, Group, Text, Badge, SimpleGrid, Title, ThemeIcon, Divider } from '@mantine/core';
import { 
  IconScale, 
  IconDroplet,
  IconUserCircle,
  IconBarbell,
  IconTrendingDown,
  IconTrendingUp,
  IconMinus,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import type { PhysicalData } from '../../../../types/physical-data.types';
import { formatDate } from '../helpers/calcImprovement';
import { 
  calculateBodyFatRanges,
  calculateAge
} from '../helpers/calcRanges';
import { useAuth } from '../../../../hooks/useAuth';
import type { LatestRecordCardProps } from '../../../../types/physical-data-components.types';

function TrendBadge({ current, previous, lowerIsBetter = false, unit = '' }: {
  current?: number | null;
  previous?: number | null;
  lowerIsBetter?: boolean;
  unit?: string;
}) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (diff === 0) return (
    <Group gap={4}>
      <IconMinus size={12} color="var(--mantine-color-gray-5)" />
      <Text size="xs" c="dimmed">Stable</Text>
    </Group>
  );
  const isGood = lowerIsBetter ? diff < 0 : diff > 0;
  const color = isGood ? 'green' : 'red';
  const sign = diff > 0 ? '+' : '';
  return (
    <Group gap={4}>
      {diff < 0
        ? <IconTrendingDown size={13} color={`var(--mantine-color-${color}-6)`} />
        : <IconTrendingUp size={13} color={`var(--mantine-color-${color}-6)`} />
      }
      <Text size="xs" c={color} fw={500}>
        {sign}{diff.toFixed(1)}{unit} this month
      </Text>
    </Group>
  );
}

function getBodyFatZone(bodyFat: number, gender: string, age: number): { label: string; color: string } {
  // Simplified zones
  const isMale = gender === 'male';
  if (bodyFat < (isMale ? 6 : 14)) return { label: 'Essential Fat', color: 'blue' };
  if (bodyFat < (isMale ? 14 : 21)) return { label: 'Athletic Zone', color: 'indigo' };
  if (bodyFat < (isMale ? 18 : 25)) return { label: 'Optimal Zone', color: 'green' };
  if (bodyFat < (isMale ? 25 : 32)) return { label: 'Acceptable', color: 'yellow' };
  return { label: 'High Range', color: 'red' };
}

function getBMIZone(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
  if (bmi < 25) return { label: 'Healthy Range', color: 'green' };
  if (bmi < 30) return { label: 'Overweight', color: 'yellow' };
  return { label: 'Obese', color: 'red' };
}

export function LatestRecordCard({ record, previousRecord, bmi }: LatestRecordCardProps) {
  const { user } = useAuth();
  const userAge = user?.birthDate ? calculateAge(user.birthDate) : 30;
  const userGender = user?.gender || 'male';

  const bfZone = record.bodyFatPercent != null
    ? getBodyFatZone(record.bodyFatPercent, userGender, userAge)
    : null;
  const bmiZone = bmi?.bmi != null ? getBMIZone(bmi.bmi) : null;

  // Crude muscle mass estimate: lean body mass % from body fat
  const muscleMassPct = record.bodyFatPercent != null
    ? Math.max(0, 100 - record.bodyFatPercent - 15).toFixed(1)
    : null;

  return (
    <Paper p="lg" radius="md" withBorder className="pd-latest-card">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={3}>Latest Recorded Metrics</Title>
          <Badge variant="light" color="gray" size="md">
            Last Update: {formatDate(record.dateRecorded)}
          </Badge>
        </Group>

        <Divider />

        {/* Metric tiles */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {/* Weight */}
          <Paper className="pd-metric-tile" p="md" radius="md" withBorder>
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="indigo" size="md" radius="md">
                <IconScale size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" fw={500}>Current Weight</Text>
            </Group>
            <Text size="2rem" fw={800} lh={1.1}>
              {record.weightKg} <Text span size="md" c="dimmed" fw={400}>kg</Text>
            </Text>
            <TrendBadge
              current={record.weightKg}
              previous={previousRecord?.weightKg}
              lowerIsBetter={false}
              unit=" kg"
            />
          </Paper>

          {/* Body Fat */}
          <Paper className="pd-metric-tile" p="md" radius="md" withBorder>
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="cyan" size="md" radius="md">
                <IconDroplet size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" fw={500}>Body Fat %</Text>
            </Group>
            <Text size="2rem" fw={800} lh={1.1}>
              {record.bodyFatPercent != null ? record.bodyFatPercent : '\u2014'}
              {record.bodyFatPercent != null && (
                <Text span size="md" c="dimmed" fw={400}> %</Text>
              )}
            </Text>
            {bfZone && (
              <Group gap={4} mt={4}>
                <IconCircleCheck size={13} color={`var(--mantine-color-${bfZone.color}-6)`} />
                <Badge variant="light" color={bfZone.color} size="sm">{bfZone.label}</Badge>
              </Group>
            )}
          </Paper>

          {/* BMI */}
          <Paper className="pd-metric-tile" p="md" radius="md" withBorder>
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="violet" size="md" radius="md">
                <IconUserCircle size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" fw={500}>BMI Index</Text>
            </Group>
            <Text size="2rem" fw={800} lh={1.1}>
              {bmi?.bmi != null ? bmi.bmi.toFixed(1) : '\u2014'}
              {bmi?.bmi != null && (
                <Text span size="md" c="dimmed" fw={400}> pt</Text>
              )}
            </Text>
            {bmiZone && (
              <Group gap={4} mt={4}>
                <IconInfoCircle size={13} color={`var(--mantine-color-${bmiZone.color}-6)`} />
                <Badge variant="light" color={bmiZone.color} size="sm">{bmiZone.label}</Badge>
              </Group>
            )}
          </Paper>

          {/* Muscle Mass / Lean Focus */}
          <Paper className="pd-metric-tile pd-metric-tile--accent" p="md" radius="md" withBorder>
            <Group gap="sm" mb="xs">
              <ThemeIcon variant="light" color="orange" size="md" radius="md">
                <IconBarbell size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" fw={500}>Lean Muscle Focus</Text>
            </Group>
            {muscleMassPct != null ? (
              <>
                <Text size="2rem" fw={800} lh={1.1}>
                  {muscleMassPct}
                  <Text span size="md" c="dimmed" fw={400}> %</Text>
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  Estimated lean body mass ratio
                </Text>
              </>
            ) : (
              <Text size="sm" c="dimmed">
                Add body fat % to calculate lean mass
              </Text>
            )}
          </Paper>
        </SimpleGrid>

        {/* Body Measurements section */}
        {record.measurements && Object.values(record.measurements).some(Boolean) && (
          <>
            <Divider label="Body Measurements" labelPosition="left" />
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm">
              {record.measurements.chest && (
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Chest</Text>
                  <Text fw={700}>{record.measurements.chest} cm</Text>
                </Stack>
              )}
              {record.measurements.waist && (
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Waist</Text>
                  <Text fw={700}>{record.measurements.waist} cm</Text>
                </Stack>
              )}
              {record.measurements.hips && (
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Hips</Text>
                  <Text fw={700}>{record.measurements.hips} cm</Text>
                </Stack>
              )}
              {record.measurements.arms && (
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Arms</Text>
                  <Text fw={700}>{record.measurements.arms} cm</Text>
                </Stack>
              )}
              {record.measurements.legs && (
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Legs</Text>
                  <Text fw={700}>{record.measurements.legs} cm</Text>
                </Stack>
              )}
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Paper>
  );
}

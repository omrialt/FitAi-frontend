import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Button,
} from '@mantine/core';
import {
  IconScale,
  IconPercentage,
  IconRulerMeasure,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { BodyProgressCardProps } from '../../types/dashboard-components.types';
import type { CreatePhysicalDataDto, UpdatePhysicalDataDto } from '../../types/physical-data.types';
import { MeasurementModal } from '../profile/physical-data/modals/MeasurementModal';
import { physicalDataService } from '../../services/physical-data.service';

function TrendIcon({ value }: { value: number }) {
  if (value > 0)
    return <IconTrendingUp size={14} color="var(--mantine-color-green-5)" />;
  if (value < 0)
    return <IconTrendingDown size={14} color="var(--mantine-color-red-5)" />;
  return <IconMinus size={14} color="var(--mantine-color-gray-5)" />;
}

export function BodyProgressCard({
  latestPhysicalData,
  weightProgress,
  progressStats,
  onDataUpdate,
}: BodyProgressCardProps) {
  const hasData = latestPhysicalData != null;
  const [modalOpened, setModalOpened] = useState(false);

  const handleSave = async (data: CreatePhysicalDataDto) => {
    await physicalDataService.create(data);
    onDataUpdate?.();
  };

  const handleUpdate = async (id: string, data: UpdatePhysicalDataDto) => {
    await physicalDataService.update(id, data);
    onDataUpdate?.();
  };

  return (
    <>
    <Paper className="dashboard-card" radius="md" p="lg" withBorder>
      <Group justify="space-between" mb="lg">
        <Group gap="xs">
          <IconScale size={20} color="var(--mantine-color-cyan-5)" />
          <Title order={4}>Body Progress</Title>
        </Group>
        <Button
          variant="light"
          color="cyan"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => setModalOpened(true)}
        >
          {hasData ? 'Update' : 'Add Record'}
        </Button>
      </Group>

      {!hasData ? (
        <Stack align="center" gap="md" py="xl">
          <Text c="dimmed" ta="center">
            No physical data recorded yet. Start tracking your body metrics to
            see progress.
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {/* Weight row */}
          <Paper className="dashboard-metric-card" p="sm" radius="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue" size="sm" radius="sm">
                  <IconScale size={14} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">Weight</Text>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="lg">{latestPhysicalData.weightKg} kg</Text>
                {weightProgress?.change != null && weightProgress.change !== 0 && (
                  <Badge
                    size="xs"
                    variant="light"
                    color={weightProgress.change < 0 ? 'red' : 'green'}
                    leftSection={<TrendIcon value={weightProgress.change} />}
                  >
                    {weightProgress.change > 0 ? '+' : ''}
                    {weightProgress.change.toFixed(1)} kg this month
                  </Badge>
                )}
                {weightProgress?.change === 0 && (
                  <Badge size="xs" variant="light" color="gray" leftSection={<TrendIcon value={0} />}>
                    Stable
                  </Badge>
                )}
              </Group>
            </Group>
          </Paper>

          {/* Body Fat row */}
          <Paper className="dashboard-metric-card" p="sm" radius="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon variant="light" color="violet" size="sm" radius="sm">
                  <IconPercentage size={14} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">Body Fat %</Text>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="lg">
                  {latestPhysicalData.bodyFatPercent != null
                    ? `${latestPhysicalData.bodyFatPercent} %`
                    : '—'}
                </Text>
                {progressStats?.last30Days?.fatDiff != null &&
                  progressStats.last30Days.fatDiff !== 0 ? (
                  <Badge
                    size="xs"
                    variant="light"
                    color={progressStats.last30Days.fatDiff < 0 ? 'green' : 'red'}
                    leftSection={<TrendIcon value={-progressStats.last30Days.fatDiff} />}
                  >
                    {progressStats.last30Days.fatDiff > 0 ? '+' : ''}
                    {progressStats.last30Days.fatDiff.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge size="xs" variant="light" color="gray" leftSection={<TrendIcon value={0} />}>
                    Stable
                  </Badge>
                )}
              </Group>
            </Group>
          </Paper>

          {/* Height row */}
          {latestPhysicalData.heightCm ? (
            <Paper className="dashboard-metric-card" p="sm" radius="sm">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon variant="light" color="teal" size="sm" radius="sm">
                    <IconRulerMeasure size={14} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">Height</Text>
                </Group>
                <Text fw={700} size="lg">{latestPhysicalData.heightCm} cm</Text>
              </Group>
            </Paper>
          ) : null}

          {/* Waist row */}
          {latestPhysicalData.measurements?.waist ? (
            <Paper className="dashboard-metric-card" p="sm" radius="sm">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon variant="light" color="orange" size="sm" radius="sm">
                    <IconRulerMeasure size={14} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">Waist</Text>
                </Group>
                <Text fw={700} size="lg">{latestPhysicalData.measurements.waist} cm</Text>
              </Group>
            </Paper>
          ) : null}

          <Text size="xs" c="dimmed" ta="right">
            Last recorded:{' '}
            {new Date(latestPhysicalData.dateRecorded).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </Text>
        </Stack>
      )}
    </Paper>

    <MeasurementModal
      opened={modalOpened}
      onClose={() => setModalOpened(false)}
      lastRecord={latestPhysicalData}
      onSave={handleSave}
      onUpdate={handleUpdate}
    />
  </>
  );
}

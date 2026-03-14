import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  SimpleGrid,
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
        <Stack gap="md">
          {/* Current measurements */}
          <SimpleGrid cols={2} spacing="sm">
            <Paper className="dashboard-metric-card" p="sm" radius="sm">
              <Group gap="xs" mb={4}>
                <ThemeIcon variant="light" color="blue" size="sm" radius="sm">
                  <IconScale size={14} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Weight
                </Text>
              </Group>
              <Group gap={4} align="baseline">
                <Text fw={700} size="lg">
                  {latestPhysicalData.weightKg}
                </Text>
                <Text size="xs" c="dimmed">
                  kg
                </Text>
                {weightProgress?.change != null && weightProgress.change !== 0 && (
                  <Badge
                    size="xs"
                    variant="light"
                    color={weightProgress.change < 0 ? 'red' : 'green'}
                    leftSection={<TrendIcon value={weightProgress.change} />}
                  >
                    {weightProgress.change > 0 ? '+' : ''}
                    {weightProgress.change.toFixed(1)}
                  </Badge>
                )}
              </Group>
            </Paper>

            <Paper className="dashboard-metric-card" p="sm" radius="sm">
              <Group gap="xs" mb={4}>
                <ThemeIcon variant="light" color="violet" size="sm" radius="sm">
                  <IconPercentage size={14} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Body Fat
                </Text>
              </Group>
              <Group gap={4} align="baseline">
                <Text fw={700} size="lg">
                  {latestPhysicalData.bodyFatPercent != null
                    ? latestPhysicalData.bodyFatPercent
                    : '—'}
                </Text>
                <Text size="xs" c="dimmed">
                  {latestPhysicalData.bodyFatPercent != null ? '%' : ''}
                </Text>
                {progressStats?.last30Days?.fatDiff != null &&
                  progressStats.last30Days.fatDiff !== 0 && (
                    <Badge
                      size="xs"
                      variant="light"
                      color={progressStats.last30Days.fatDiff < 0 ? 'green' : 'red'}
                      leftSection={
                        <TrendIcon value={-progressStats.last30Days.fatDiff} />
                      }
                    >
                      {progressStats.last30Days.fatDiff > 0 ? '+' : ''}
                      {progressStats.last30Days.fatDiff.toFixed(1)}%
                    </Badge>
                  )}
              </Group>
            </Paper>

            {latestPhysicalData.heightCm && (
              <Paper className="dashboard-metric-card" p="sm" radius="sm">
                <Group gap="xs" mb={4}>
                  <ThemeIcon variant="light" color="teal" size="sm" radius="sm">
                    <IconRulerMeasure size={14} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    Height
                  </Text>
                </Group>
                <Group gap={4} align="baseline">
                  <Text fw={700} size="lg">
                    {latestPhysicalData.heightCm}
                  </Text>
                  <Text size="xs" c="dimmed">
                    cm
                  </Text>
                </Group>
              </Paper>
            )}

            {latestPhysicalData.measurements && (
              <Paper className="dashboard-metric-card" p="sm" radius="sm">
                <Text size="xs" c="dimmed" mb={4}>
                  Measurements
                </Text>
                <Stack gap={2}>
                  {latestPhysicalData.measurements.chest && (
                    <Text size="xs">
                      Chest:{' '}
                      <Text span fw={600}>
                        {latestPhysicalData.measurements.chest} cm
                      </Text>
                    </Text>
                  )}
                  {latestPhysicalData.measurements.waist && (
                    <Text size="xs">
                      Waist:{' '}
                      <Text span fw={600}>
                        {latestPhysicalData.measurements.waist} cm
                      </Text>
                    </Text>
                  )}
                  {latestPhysicalData.measurements.arms && (
                    <Text size="xs">
                      Arms:{' '}
                      <Text span fw={600}>
                        {latestPhysicalData.measurements.arms} cm
                      </Text>
                    </Text>
                  )}
                </Stack>
              </Paper>
            )}
          </SimpleGrid>

          {/* Last recorded date */}
          <Text size="xs" c="dimmed" ta="right">
            Last recorded:{' '}
            {new Date(latestPhysicalData.dateRecorded).toLocaleDateString(
              undefined,
              { year: 'numeric', month: 'short', day: 'numeric' },
            )}
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

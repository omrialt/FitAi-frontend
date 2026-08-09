/**
 * MeasurementsChart - Chart component for displaying physical data trends
 */

import { Paper, Title, Text, Box, Stack, SimpleGrid } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatChartDate } from '../helpers/calcImprovement';
import type { MeasurementsChartProps } from '../../../../types/physical-data-components.types';

export function MeasurementsChart({ data }: MeasurementsChartProps) {
  const { t } = useTranslation();

  // Series names are also matched in the tooltip formatter below, so keep them in one place
  const weightSeriesName = t('physicalData.weight');
  const bodyFatSeriesName = t('physicalData.bodyFatPct');

  // Sort data by date (oldest first for chronological chart)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => 
      new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime()
    );
  }, [data]);

  // Combined Weight + Body Fat dataset for dual-axis chart
  const weightBodyFatData = useMemo(() =>
    sortedData.map(record => ({
      date: formatChartDate(record.dateRecorded),
      weight: record.weightKg,
      bodyFat: record.bodyFatPercent ?? null,
    })), [sortedData]);

  const hasBodyFat = useMemo(() =>
    sortedData.some(r => r.bodyFatPercent != null), [sortedData]);

  const measurementsData = useMemo(() => 
    sortedData
      .filter(record => record.measurements)
      .map(record => ({
        date: formatChartDate(record.dateRecorded),
        chest: record.measurements?.chest || null,
        waist: record.measurements?.waist || null,
        hips: record.measurements?.hips || null,
        arms: record.measurements?.arms || null,
        legs: record.measurements?.legs || null,
      })), [sortedData]);

  if (data.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          {t('physicalData.noChartData')}
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={3}>{t('physicalData.performanceTrends')}</Title>
        <Text size="sm" c="dimmed">{t('physicalData.performanceTrendsSubtitle')}</Text>
      </div>
      
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Dual-axis Weight + Body Fat Chart */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Title order={4} size="h5">{t('physicalData.weightAndBodyFat')}</Title>
            <Box style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightBodyFatData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
                    <XAxis dataKey="date" style={{ fontSize: '11px' }} tick={{ fill: 'var(--color-chart-axis)' }} />
                    {/* Left Y-axis: Weight (kg) */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      label={{ value: t('common.kg'), angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: 'var(--color-chart-1)' } }}
                      style={{ fontSize: '11px' }}
                      tick={{ fill: 'var(--color-chart-1)' }}
                    />
                    {/* Right Y-axis: Body Fat (%) */}
                    {hasBodyFat && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: '%', angle: 90, position: 'insideRight', style: { fontSize: '11px', fill: 'var(--color-chart-2)' } }}
                        style={{ fontSize: '11px' }}
                        tick={{ fill: 'var(--color-chart-2)' }}
                      />
                    )}
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === weightSeriesName
                          ? [`${value} ${t('common.kg')}`, name]
                          : [`${value}%`, name]
                      }
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-chart-grid)', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: 'var(--color-chart-1)', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: 'var(--color-chart-1)' }}
                      name={weightSeriesName}
                    />
                    {hasBodyFat && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--color-chart-2)', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: 'var(--color-chart-2)' }}
                        name={bodyFatSeriesName}
                        connectNulls={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
          </Stack>
        </Paper>

        {/* Body Measurements Chart */}
        {measurementsData.length > 0 && (
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Title order={4} size="h5">{t('physicalData.bodyMeasurements')}</Title>
                <Box style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" />
                      <XAxis dataKey="date" style={{ fontSize: '11px' }} tick={{ fill: 'var(--color-chart-axis)' }} />
                      <YAxis
                        label={{ value: t('physicalData.cm'), angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: 'var(--color-chart-axis)' } }}
                        style={{ fontSize: '11px' }}
                        tick={{ fill: 'var(--color-chart-axis)' }}
                      />
                      <Tooltip
                        formatter={(value: number) => `${value} ${t('physicalData.cm')}`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-chart-grid)', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="chest" stroke="var(--color-chart-1)" strokeWidth={2} name={t('physicalData.chest')} dot={{ r: 3, fill: 'var(--color-chart-1)', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="waist" stroke="var(--color-chart-2)" strokeWidth={2} name={t('physicalData.waist')} dot={{ r: 3, fill: 'var(--color-chart-2)', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="hips" stroke="var(--color-chart-4)" strokeWidth={2} name={t('physicalData.hips')} dot={{ r: 3, fill: 'var(--color-chart-4)', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="arms" stroke="var(--color-success)" strokeWidth={2} name={t('physicalData.arms')} dot={{ r: 3, fill: 'var(--color-success)', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="legs" stroke="var(--color-chart-3)" strokeWidth={2} name={t('physicalData.legs')} dot={{ r: 3, fill: 'var(--color-chart-3)', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>
    </Stack>
  );
}
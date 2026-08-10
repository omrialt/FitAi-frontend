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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--color-chart-axis)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                    />
                    {/* Left Y-axis: Weight (kg) */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      label={{ value: t('common.kg'), angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: 'var(--color-chart-1)' } }}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--color-chart-1)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                    />
                    {/* Right Y-axis: Body Fat (%) */}
                    {hasBodyFat && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: '%', angle: 90, position: 'insideRight', style: { fontSize: '11px', fill: 'var(--color-chart-2)' } }}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--color-chart-2)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                      />
                    )}
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === weightSeriesName
                          ? [`${value} ${t('common.kg')}`, name]
                          : [`${value}%`, name]
                      }
                      contentStyle={{
                        background: 'var(--color-surface-container-highest)',
                        border: '1px solid rgb(255 255 255 / 0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--color-on-surface)',
                      }}
                      cursor={{ stroke: 'rgb(230 231 234 / 0.18)', strokeWidth: 1, fill: 'none' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--color-chart-1)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                      name={weightSeriesName}
                    />
                    {hasBodyFat && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: 'var(--color-chart-2)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
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
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
                      <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--color-chart-axis)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                    />
                      <YAxis
                        label={{ value: t('physicalData.cm'), angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: 'var(--color-chart-axis)' } }}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--color-chart-axis)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                      />
                      <Tooltip
                        formatter={(value: number) => `${value} ${t('physicalData.cm')}`}
                        contentStyle={{
                        background: 'var(--color-surface-container-highest)',
                        border: '1px solid rgb(255 255 255 / 0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--color-on-surface)',
                      }}
                      cursor={{ stroke: 'rgb(230 231 234 / 0.18)', strokeWidth: 1, fill: 'none' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="chest" stroke="var(--color-chart-1)" strokeWidth={2} name={t('physicalData.chest')} dot={false} />
                      <Line type="monotone" dataKey="waist" stroke="var(--color-chart-2)" strokeWidth={2} name={t('physicalData.waist')} dot={false} />
                      <Line type="monotone" dataKey="hips" stroke="var(--color-chart-4)" strokeWidth={2} name={t('physicalData.hips')} dot={false} />
                      <Line type="monotone" dataKey="arms" stroke="var(--color-success)" strokeWidth={2} name={t('physicalData.arms')} dot={false} />
                      <Line type="monotone" dataKey="legs" stroke="var(--color-chart-3)" strokeWidth={2} name={t('physicalData.legs')} dot={false} />
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
/**
 * MeasurementsChart - Chart component for displaying physical data trends
 */

import { Paper, Title, Text, Box, Stack, SimpleGrid } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import type { PhysicalData } from '../../../../types/physical-data.types';
import { formatChartDate } from '../helpers/calcImprovement';
import type { MeasurementsChartProps } from '../../../../types/physical-data-components.types';

export function MeasurementsChart({ data }: MeasurementsChartProps) {

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
          No data available for charts
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={3}>Performance Trends</Title>
        <Text size="sm" c="dimmed">Weight vs Body Fat percentage correlation over 6 months</Text>
      </div>
      
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Dual-axis Weight + Body Fat Chart */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Title order={4} size="h5">Weight & Body Fat</Title>
            <Box style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightBodyFatData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.6)" />
                    <XAxis dataKey="date" style={{ fontSize: '11px' }} tick={{ fill: '#64748b' }} />
                    {/* Left Y-axis: Weight (kg) */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      label={{ value: 'kg', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#6366f1' } }}
                      style={{ fontSize: '11px' }}
                      tick={{ fill: '#6366f1' }}
                    />
                    {/* Right Y-axis: Body Fat (%) */}
                    {hasBodyFat && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: '%', angle: 90, position: 'insideRight', style: { fontSize: '11px', fill: '#06b6d4' } }}
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#06b6d4' }}
                      />
                    )}
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === 'Weight' ? [`${value} kg`, name] : [`${value}%`, name]
                      }
                      contentStyle={{ borderRadius: '8px', border: '1px solid rgba(226,232,240,0.6)', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                      name="Weight"
                    />
                    {hasBodyFat && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#06b6d4' }}
                        name="Body Fat %"
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
              <Title order={4} size="h5">Body Measurements</Title>
                <Box style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.6)" />
                      <XAxis dataKey="date" style={{ fontSize: '11px' }} tick={{ fill: '#64748b' }} />
                      <YAxis
                        label={{ value: 'cm', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#64748b' } }}
                        style={{ fontSize: '11px' }}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip
                        formatter={(value: number) => `${value} cm`}
                        contentStyle={{ borderRadius: '8px', border: '1px solid rgba(226,232,240,0.6)', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="chest" stroke="#6366f1" strokeWidth={2} name="Chest" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="waist" stroke="#06b6d4" strokeWidth={2} name="Waist" dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="hips" stroke="#f97316" strokeWidth={2} name="Hips" dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="arms" stroke="#22c55e" strokeWidth={2} name="Arms" dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="legs" stroke="#8b5cf6" strokeWidth={2} name="Legs" dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} />
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
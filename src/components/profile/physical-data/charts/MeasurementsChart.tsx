/**
 * MeasurementsChart - Chart component for displaying physical data trends
 */

import { Paper, Title, Text, Box, Stack, SimpleGrid } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo, Activity } from 'react';
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

  // Prepare all chart data
  const weightData = useMemo(() => 
    sortedData.map(record => ({
      date: formatChartDate(record.dateRecorded),
      weight: record.weightKg,
    })), [sortedData]);

  const bodyFatData = useMemo(() => 
    sortedData
      .filter(record => record.bodyFatPercent)
      .map(record => ({
        date: formatChartDate(record.dateRecorded),
        bodyFat: record.bodyFatPercent,
      })), [sortedData]);

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
      <Title order={3}>Progress Trends</Title>
      
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Weight Chart */}
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Title order={4} size="h5">Weight Progress</Title>
            <Activity mode="visible">
              <Box style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
                    <Tooltip formatter={(value: number) => `${value} kg`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Weight"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Activity>
          </Stack>
        </Paper>

        {/* Body Fat Chart */}
        {bodyFatData.length > 0 && (
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Title order={4} size="h5">Body Fat Progress</Title>
              <Activity mode="visible">
                <Box style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodyFatData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis label={{ value: 'Body Fat %', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bodyFat" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Body Fat %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Activity>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>

      {/* Measurements Chart */}
      {measurementsData.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Title order={4} size="h5">Body Measurements</Title>
            <Activity mode="visible">
              <Box style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={measurementsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis label={{ value: 'Measurements (cm)', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
                    <Tooltip formatter={(value: number) => `${value} cm`} />
                    <Legend />
                    <Line type="monotone" dataKey="chest" stroke="#8884d8" strokeWidth={2} name="Chest" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="waist" stroke="#82ca9d" strokeWidth={2} name="Waist" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="hips" stroke="#ffc658" strokeWidth={2} name="Hips" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="arms" stroke="#ff7c7c" strokeWidth={2} name="Arms" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="legs" stroke="#8dd1e1" strokeWidth={2} name="Legs" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Activity>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
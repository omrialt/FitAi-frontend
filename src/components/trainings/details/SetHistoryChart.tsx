/**
 * SetHistoryChart - Progress chart for set history
 */

import { Box, Text } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  weight: number;
  reps: number;
  isTarget?: boolean;
}

interface SetHistoryChartProps {
  chartData: ChartDataPoint[];
}

export function SetHistoryChart({ chartData }: SetHistoryChartProps) {
  return (
    <Box>
      <Text fw={500} size="sm" mb="xs">
        Progress Chart
      </Text>
      <Box style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="weight" 
              stroke="#228be6" 
              strokeWidth={2}
              name="Weight (kg)"
              dot={{ r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="reps" 
              stroke="#40c057" 
              strokeWidth={2}
              name="Reps"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

/**
 * SetHistoryChart - Progress chart for set history
 */

import { Box, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import type { ChartDataPoint, SetHistoryChartProps } from '../../../types/trainings-components.types';

export function SetHistoryChart({ chartData }: SetHistoryChartProps) {
  const { t } = useTranslation();

  return (
    <Box>
      <Text fw={500} size="sm" mb="xs">
        {t('trainings.progressChart')}
      </Text>
      {/* Charts stay LTR even in RTL layouts */}
      <Box dir="ltr" style={{ width: '100%', height: 250 }}>
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
              name={t('trainings.weightKg')}
              dot={{ r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="reps" 
              stroke="#40c057" 
              strokeWidth={2}
              name={t('trainings.repsHeader')}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

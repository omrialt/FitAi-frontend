/**
 * useChart Hook
 * 
 * Prepare and normalize data for Recharts graphs, with reusable datasets and options.
 * Simplifies data transformation for fitness charts (progress, workouts, nutrition).
 * 
 * @example
 * ```tsx
 * function WeightProgressChart() {
 *   const { data, loading } = useApi<ProgressStats[]>();
 *   const chartData = useChart(data, {
 *     xKey: 'date',
 *     yKeys: ['weight', 'bodyFat'],
 *     formatX: (date) => new Date(date).toLocaleDateString(),
 *     formatY: (value) => `${value} kg`,
 *   });
 * 
 *   return (
 *     <LineChart width={600} height={300} data={chartData.formatted}>
 *       <CartesianGrid strokeDasharray="3 3" />
 *       <XAxis dataKey="date" />
 *       <YAxis />
 *       <Tooltip formatter={chartData.formatters.yFormatter} />
 *       <Legend />
 *       <Line type="monotone" dataKey="weight" stroke="#8884d8" />
 *       <Line type="monotone" dataKey="bodyFat" stroke="#82ca9d" />
 *     </LineChart>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function CalorieChart() {
 *   const data = [
 *     { day: 'Mon', calories: 2500, protein: 180, carbs: 250, fat: 70 },
 *     { day: 'Tue', calories: 2800, protein: 200, carbs: 280, fat: 75 },
 *     // ...
 *   ];
 * 
 *   const chartData = useChart(data, {
 *     xKey: 'day',
 *     yKeys: ['protein', 'carbs', 'fat'],
 *     colors: ['#ff6b6b', '#4ecdc4', '#ffe66d'],
 *   });
 * 
 *   return (
 *     <BarChart width={600} height={300} data={chartData.formatted}>
 *       <CartesianGrid strokeDasharray="3 3" />
 *       <XAxis dataKey="day" />
 *       <YAxis />
 *       <Tooltip />
 *       <Legend />
 *       <Bar dataKey="protein" fill={chartData.colors[0]} />
 *       <Bar dataKey="carbs" fill={chartData.colors[1]} />
 *       <Bar dataKey="fat" fill={chartData.colors[2]} />
 *     </BarChart>
 *   );
 * }
 * ```
 */

import { useMemo } from 'react';

interface UseChartOptions<T = Record<string, unknown>> {
  xKey: keyof T;
  yKeys: (keyof T)[];
  formatX?: (value: unknown) => string | number;
  formatY?: (value: unknown) => string | number;
  colors?: string[];
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
}

interface UseChartReturn<T = Record<string, unknown>> {
  formatted: T[];
  colors: string[];
  formatters: {
    xFormatter: (value: unknown) => string | number;
    yFormatter: (value: unknown) => string | number;
  };
  stats: {
    min: number;
    max: number;
    avg: number;
    total: number;
  };
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#a4de6c',
];

export function useChart<T extends Record<string, unknown>>(
  data: T[] | null | undefined,
  options: UseChartOptions<T>
): UseChartReturn<T> {
  const {
    xKey,
    yKeys,
    formatX = (val) => String(val),
    formatY = (val) => String(val),
    colors = DEFAULT_COLORS,
    filterFn,
    sortFn,
  } = options;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        formatted: [],
        colors,
        formatters: {
          xFormatter: formatX,
          yFormatter: formatY,
        },
        stats: {
          min: 0,
          max: 0,
          avg: 0,
          total: 0,
        },
      };
    }

    // Filter data if filter function provided
    let processed = filterFn ? data.filter(filterFn) : [...data];

    // Sort data if sort function provided
    if (sortFn) {
      processed = processed.sort(sortFn);
    }

    // Calculate statistics across all yKeys
    const allValues: number[] = [];
    processed.forEach((item) => {
      yKeys.forEach((key) => {
        const value = item[key];
        if (typeof value === 'number') {
          allValues.push(value);
        }
      });
    });

    const stats = {
      min: allValues.length > 0 ? Math.min(...allValues) : 0,
      max: allValues.length > 0 ? Math.max(...allValues) : 0,
      avg: allValues.length > 0 
        ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length 
        : 0,
      total: allValues.reduce((sum, val) => sum + val, 0),
    };

    return {
      formatted: processed,
      colors,
      formatters: {
        xFormatter: formatX,
        yFormatter: formatY,
      },
      stats,
    };
  }, [data, xKey, yKeys, formatX, formatY, colors, filterFn, sortFn]);

  return chartData;
}

/**
 * useProgressChart Hook
 * 
 * Specialized hook for fitness progress charts (weight, body fat, measurements).
 * 
 * @example
 * ```tsx
 * function ProgressDashboard() {
 *   const { data } = useApi<ProgressStats[]>();
 *   const weightChart = useProgressChart(data, 'weight', {
 *     timeRange: 'month',
 *     target: 75, // kg
 *   });
 * 
 *   return (
 *     <div>
 *       <h3>Weight Progress</h3>
 *       <p>Current: {weightChart.current} kg</p>
 *       <p>Change: {weightChart.change > 0 ? '+' : ''}{weightChart.change} kg</p>
 *       <p>Target: {weightChart.target} kg</p>
 *       
 *       <LineChart data={weightChart.data}>
 *         <Line dataKey="value" stroke="#8884d8" />
 *         {weightChart.target && (
 *           <ReferenceLine y={weightChart.target} stroke="red" strokeDasharray="3 3" />
 *         )}
 *       </LineChart>
 *     </div>
 *   );
 * }
 * ```
 */

interface ProgressDataPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

interface UseProgressChartOptions {
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  target?: number;
  unit?: string;
}

interface UseProgressChartReturn {
  data: ProgressDataPoint[];
  current: number | null;
  previous: number | null;
  change: number;
  changePercentage: number;
  target: number | null;
  progressToTarget: number;
  stats: {
    min: number;
    max: number;
    avg: number;
  };
}

export function useProgressChart(
  data: ProgressDataPoint[] | null | undefined,
  metric: string,
  options: UseProgressChartOptions = {}
): UseProgressChartReturn {
  const {
    timeRange = 'all',
    target = null,
    unit = '',
  } = options;

  const progressData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        data: [],
        current: null,
        previous: null,
        change: 0,
        changePercentage: 0,
        target,
        progressToTarget: 0,
        stats: { min: 0, max: 0, avg: 0 },
      };
    }

    // Sort by date
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter by time range
    const now = new Date();
    const filtered = sorted.filter((item) => {
      const itemDate = new Date(item.date);
      const diffMs = now.getTime() - itemDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      switch (timeRange) {
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'quarter':
          return diffDays <= 90;
        case 'year':
          return diffDays <= 365;
        default:
          return true;
      }
    });

    if (filtered.length === 0) {
      return {
        data: [],
        current: null,
        previous: null,
        change: 0,
        changePercentage: 0,
        target,
        progressToTarget: 0,
        stats: { min: 0, max: 0, avg: 0 },
      };
    }

    // Get current and previous values
    const current = filtered[filtered.length - 1].value;
    const previous = filtered.length > 1 ? filtered[0].value : current;
    const change = current - previous;
    const changePercentage = previous !== 0 ? (change / previous) * 100 : 0;

    // Calculate progress to target
    const progressToTarget = target
      ? ((current - previous) / (target - previous)) * 100
      : 0;

    // Calculate stats
    const values = filtered.map((item) => item.value);
    const stats = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
    };

    return {
      data: filtered,
      current,
      previous,
      change: Number(change.toFixed(2)),
      changePercentage: Number(changePercentage.toFixed(2)),
      target,
      progressToTarget: Number(progressToTarget.toFixed(2)),
      stats: {
        min: Number(stats.min.toFixed(2)),
        max: Number(stats.max.toFixed(2)),
        avg: Number(stats.avg.toFixed(2)),
      },
    };
  }, [data, metric, timeRange, target]);

  return progressData;
}

/**
 * useWorkoutChart Hook
 * 
 * Specialized hook for workout volume/intensity charts.
 * 
 * @example
 * ```tsx
 * function WorkoutVolumeChart() {
 *   const { data } = useApi<ExercisePerformance[]>();
 *   const volumeChart = useWorkoutChart(data, 'volume');
 * 
 *   return (
 *     <BarChart data={volumeChart.data}>
 *       <Bar dataKey="volume" fill="#8884d8" />
 *       <XAxis dataKey="exercise" />
 *     </BarChart>
 *   );
 * }
 * ```
 */

interface WorkoutDataPoint {
  exercise: string;
  date: string;
  weight: number;
  reps: number;
  sets: number;
  [key: string]: unknown;
}

export function useWorkoutChart(
  data: WorkoutDataPoint[] | null | undefined,
  type: 'volume' | 'intensity' | 'frequency' = 'volume'
) {
  const workoutData = useMemo(() => {
    if (!data || data.length === 0) {
      return { data: [], stats: { total: 0, avg: 0, max: 0 } };
    }

    const processed = data.map((item) => {
      const volume = item.weight * item.reps * item.sets;
      const intensity = item.weight;
      const frequency = item.sets;

      return {
        ...item,
        volume,
        intensity,
        frequency,
      };
    });

    const values = processed.map((item) => item[type] as number);
    const stats = {
      total: values.reduce((sum, val) => sum + val, 0),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      max: Math.max(...values),
    };

    return { data: processed, stats };
  }, [data, type]);

  return workoutData;
}

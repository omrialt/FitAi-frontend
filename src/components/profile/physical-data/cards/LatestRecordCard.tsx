/**
 * LatestRecordCard - Card displaying the latest physical data measurement
 */

import { Activity } from 'react';
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Title, Divider } from '@mantine/core';
import { 
  IconRuler, 
  IconScale, 
  IconDroplet,
  IconUserCircle,
  IconTrendingUp,
  IconTrendingDown
} from '@tabler/icons-react';
import type { PhysicalData } from '../../../../types/physical-data.types';
import { formatDate, calcImprovement } from '../helpers/calcImprovement';
import { MetricInfoTooltip } from './MetricInfoTooltip';
import { 
  calculateBMIRanges, 
  calculateWeightRanges, 
  calculateBodyFatRanges,
  calculateAge
} from '../helpers/calcRanges';
import { useAuth } from '../../../../hooks/useAuth';

interface LatestRecordCardProps {
  record: PhysicalData;
  previousRecord?: PhysicalData | null;
  bmi?: { bmi: number; category: string };
}

export function LatestRecordCard({ record, previousRecord, bmi }: LatestRecordCardProps) {
  const { user } = useAuth();
  
  const weightImprovement = calcImprovement(record.weightKg, previousRecord?.weightKg, true);
  const bodyFatImprovement = calcImprovement(record.bodyFatPercent, previousRecord?.bodyFatPercent, true);
  const chestImprovement = calcImprovement(record.measurements?.chest, previousRecord?.measurements?.chest, false);
  const waistImprovement = calcImprovement(record.measurements?.waist, previousRecord?.measurements?.waist, true);
  const hipsImprovement = calcImprovement(record.measurements?.hips, previousRecord?.measurements?.hips, true);
  const armsImprovement = calcImprovement(record.measurements?.arms, previousRecord?.measurements?.arms, false);
  const legsImprovement = calcImprovement(record.measurements?.legs, previousRecord?.measurements?.legs, false);

  // Calculate BMI for previous record if available
  const previousBmi = previousRecord 
    ? previousRecord.weightKg / Math.pow(previousRecord.heightCm / 100, 2)
    : undefined;
  const currentBmi = bmi?.bmi;
  const bmiImprovement = currentBmi && previousBmi ? calcImprovement(currentBmi, previousBmi, true) : '—';

  // Get user metrics for range calculations
  const userAge = user?.birthDate ? calculateAge(user.birthDate) : 30;
  const userGender = user?.gender || 'male';
  
  // Calculate ranges
  const bmiRanges = calculateBMIRanges();
  const weightRanges = calculateWeightRanges(record.heightCm);
  const bodyFatRanges = calculateBodyFatRanges(userGender, userAge);

  const calculateAbsoluteChange = (current: number | undefined, previous: number | undefined): string => {
    if (!current || !previous) return '—';
    const diff = current - previous;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? `${diff.toFixed(1)}` : '0.0';
  };

  const renderImprovement = (improvement: string, current?: number, previous?: number, lowerIsBetter: boolean = false) => {
    if (improvement === '—') return null;
    
    // Calculate actual change (not percentage)
    const actualChange = current && previous ? current - previous : 0;
    const absoluteChange = calculateAbsoluteChange(current, previous);
    
    // For weight, body fat, waist, hips: decrease is good (green), increase is bad (red)
    // For chest, arms, legs: increase is good (green), decrease is bad (red)
    const isIncrease = actualChange > 0;
    const isDecrease = actualChange < 0;
    
    const isGood = lowerIsBetter ? isDecrease : isIncrease;
    const isBad = lowerIsBetter ? isIncrease : isDecrease;
    
    return (
      <Group gap={4} wrap="nowrap">
        <Text 
          size="xs" 
          c={isGood ? 'green' : isBad ? 'red' : 'dimmed'}
          fw={500}
          style={{ display: 'flex', alignItems: 'center', gap: 2 }}
        >
          {isIncrease && <IconTrendingUp size={14} />}
          {isDecrease && <IconTrendingDown size={14} />}
          {absoluteChange}
        </Text>
        <Text size="xs" c="dimmed">({improvement})</Text>
      </Group>
    );
  };

  return (
    <Paper p="lg" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3}>Latest Measurement</Title>
          <Badge variant="light" size="lg">
            {formatDate(record.dateRecorded)}
          </Badge>
        </Group>

        <Divider />

        <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="lg">
          <Stack gap="xs">
            <Group gap="xs">
              <IconRuler size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <Text size="sm" c="dimmed">Height</Text>
            </Group>
            <Text size="xl" fw={700}>
              {record.heightCm} cm
            </Text>
          </Stack>

          <Stack gap="xs">
            <Group gap="xs">
              <IconScale size={20} style={{ color: 'var(--mantine-color-green-6)' }} />
              <Text size="sm" c="dimmed">Weight</Text>
              <MetricInfoTooltip
                metricName="Weight"
                explanation={weightRanges.explanation}
                ranges={weightRanges.ranges}
                userValue={record.weightKg}
                unit=" kg"
                iconColor="var(--mantine-color-green-6)"
              />
            </Group>
            <Text size="xl" fw={700}>
              {record.weightKg} kg
            </Text>
            {renderImprovement(weightImprovement, record.weightKg, previousRecord?.weightKg, true)}
          </Stack>

          <Activity mode={record.bodyFatPercent ? "visible" : "hidden"}>
            <Stack gap="xs">
              <Group gap="xs">
                <IconDroplet size={20} style={{ color: 'var(--mantine-color-orange-6)' }} />
                <Text size="sm" c="dimmed">Body Fat</Text>
                <MetricInfoTooltip
                  metricName="Body Fat %"
                  explanation={bodyFatRanges.explanation}
                  ranges={bodyFatRanges.ranges}
                  userValue={record.bodyFatPercent || 0}
                  unit="%"
                  iconColor="var(--mantine-color-orange-6)"
                />
              </Group>
              <Text size="xl" fw={700}>
                {record.bodyFatPercent}%
              </Text>
              {renderImprovement(bodyFatImprovement, record.bodyFatPercent, previousRecord?.bodyFatPercent, true)}
            </Stack>
          </Activity>

          <Activity mode={bmi && bmi.bmi !== undefined ? "visible" : "hidden"}>
            {bmi && bmi.bmi !== undefined && (
              <Stack gap="xs">
                <Group gap="xs">
                  <IconUserCircle size={20} style={{ color: 'var(--mantine-color-violet-6)' }} />
                  <Text size="sm" c="dimmed">BMI</Text>
                  <MetricInfoTooltip
                    metricName="BMI"
                    explanation={bmiRanges.explanation}
                    ranges={bmiRanges.ranges}
                    userValue={bmi.bmi}
                    unit=""
                    iconColor="var(--mantine-color-violet-6)"
                  />
                </Group>
                <Text size="xl" fw={700}>
                  {bmi.bmi.toFixed(1)}
                </Text>
                {renderImprovement(bmiImprovement, currentBmi, previousBmi, true)}
                <Badge 
                  variant="light" 
                  color={
                    bmi.category === 'Normal weight' ? 'green' :
                    bmi.category === 'Underweight' ? 'blue' :
                    bmi.category === 'Overweight' ? 'yellow' : 'red'
                  }
                  size="sm"
                >
                  {bmi.category}
                </Badge>
              </Stack>
            )}
          </Activity>
        </SimpleGrid>

        <Activity mode={record.measurements ? "visible" : "hidden"}>
          {record.measurements && (
            <>
              <Divider label="Body Measurements" labelPosition="center" />
              
              <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
                {record.measurements.chest && (
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">Chest</Text>
                    <Text size="lg" fw={600}>{record.measurements.chest} cm</Text>
                    {renderImprovement(chestImprovement, record.measurements.chest, previousRecord?.measurements?.chest, false)}
                  </Stack>
                )}
                {record.measurements.waist && (
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">Waist</Text>
                    <Text size="lg" fw={600}>{record.measurements.waist} cm</Text>
                    {renderImprovement(waistImprovement, record.measurements.waist, previousRecord?.measurements?.waist, true)}
                  </Stack>
                )}
                {record.measurements.hips && (
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">Hips</Text>
                    <Text size="lg" fw={600}>{record.measurements.hips} cm</Text>
                    {renderImprovement(hipsImprovement, record.measurements.hips, previousRecord?.measurements?.hips, true)}
                  </Stack>
                )}
                {record.measurements.arms && (
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">Arms</Text>
                    <Text size="lg" fw={600}>{record.measurements.arms} cm</Text>
                    {renderImprovement(armsImprovement, record.measurements.arms, previousRecord?.measurements?.arms, false)}
                  </Stack>
                )}
                {record.measurements.legs && (
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">Legs</Text>
                    <Text size="lg" fw={600}>{record.measurements.legs} cm</Text>
                    {renderImprovement(legsImprovement, record.measurements.legs, previousRecord?.measurements?.legs, false)}
                  </Stack>
                )}
              </SimpleGrid>
            </>
          )}
        </Activity>
      </Stack>
    </Paper>
  );
}

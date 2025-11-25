import { NumberInput, Grid, Checkbox } from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface ProgramDetailsSectionProps {
  estimatedDuration: number | undefined;
  setEstimatedDuration: (value: number | undefined) => void;
  estimatedCalories: number | undefined;
  setEstimatedCalories: (value: number | undefined) => void;
  startDate: string | undefined;
  setStartDate: (value: string | undefined) => void;
  endDate: string | undefined;
  setEndDate: (value: string | undefined) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
}

export function ProgramDetailsSection({ 
  estimatedDuration,
  setEstimatedDuration,
  estimatedCalories,
  setEstimatedCalories,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isActive,
  setIsActive
}: ProgramDetailsSectionProps) {
  return (
    <>
      <Grid gutter="md">
        <Grid.Col span={6}>
          <NumberInput
            label="Estimated Duration (minutes)"
            placeholder="Per session"
            min={0}
            value={estimatedDuration}
            onChange={(value) => setEstimatedDuration(typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <NumberInput
            label="Estimated Calories"
            placeholder="Per session"
            min={0}
            value={estimatedCalories}
            onChange={(value) => setEstimatedCalories(typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={6}>
          <DateInput
            label="Start Date"
            placeholder="Select start date"
            value={startDate ? new Date(startDate) : null}
            onChange={(date) => {
              setStartDate(date ? (date as unknown as Date).toISOString() : undefined);
            }}
            clearable
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <DateInput
            label="End Date"
            placeholder="Select end date"
            value={endDate ? new Date(endDate) : null}
            onChange={(date) => {
              setEndDate(date ? (date as unknown as Date).toISOString() : undefined);
            }}
            clearable
          />
        </Grid.Col>
      </Grid>

      <Checkbox
        label="Active"
        checked={isActive}
        onChange={(e) => setIsActive(e.currentTarget.checked)}
      />
    </>
  );
}

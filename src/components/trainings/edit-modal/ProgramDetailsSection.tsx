import { NumberInput, Grid, Checkbox } from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface ProgramDetailsSectionProps {
  estimatedDuration: number | undefined;
  setEstimatedDuration: (value: number | undefined) => void;
  estimatedCalories: number | undefined;
  setEstimatedCalories: (value: number | undefined) => void;
  startDate: string | undefined;
  setStartDate: (value: string | undefined) => void;
  endDate: string | undefined | null;
  setEndDate: (value: string | undefined | null) => void;
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
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Estimated Duration (minutes)"
            placeholder="Per session"
            min={0}
            required
            value={estimatedDuration}
            onChange={(value) => setEstimatedDuration(typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Estimated Calories"
            placeholder="Per session"
            min={0}
            required
            value={estimatedCalories}
            onChange={(value) => setEstimatedCalories(typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateInput
            label="Start Date"
            placeholder="Select start date"
            value={startDate ? new Date(startDate) : null}
            onChange={(date) => {
              if (!date) {
                setStartDate(undefined);
              } else if (typeof date === 'object' && 'toISOString' in date) {
                setStartDate((date as Date).toISOString());
              } else {
                setStartDate(date as string);
              }
            }}
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateInput
            label="End Date"
            placeholder="Select end date"
            value={endDate ? new Date(endDate) : null}
            onChange={(date) => {
              if (!date) {
                setEndDate(undefined);
              } else if (typeof date === 'object' && 'toISOString' in date) {
                setEndDate((date as Date).toISOString());
              } else {
                setEndDate(date as string);
              }
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

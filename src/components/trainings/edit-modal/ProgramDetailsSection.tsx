import { NumberInput, Grid, Checkbox } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import type { ProgramDetailsSectionProps } from '../../../types/trainings-components.types';

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
  const { t } = useTranslation();

  return (
    <>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label={t('trainings.form.estimatedDuration')}
            placeholder={t('trainings.form.perSession')}
            min={0}
            required
            value={estimatedDuration}
            onChange={(value) => setEstimatedDuration(typeof value === 'number' ? value : undefined)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label={t('trainings.form.estimatedCalories')}
            placeholder={t('trainings.form.perSession')}
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
            label={t('trainings.form.startDate')}
            placeholder={t('trainings.form.selectStartDate')}
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
            label={t('trainings.form.endDate')}
            placeholder={t('trainings.form.selectEndDate')}
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
        label={t('trainings.active')}
        checked={isActive}
        onChange={(e) => setIsActive(e.currentTarget.checked)}
      />
    </>
  );
}

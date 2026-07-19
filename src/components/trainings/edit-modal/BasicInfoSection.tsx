import { Activity } from 'react';
import { TextInput, Textarea, Select, Grid, NumberInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Difficulty, Target, ProgramType } from '../../../types/training-plan.types';
import type { BasicInfoSectionProps } from '../../../types/trainings-components.types';

export function BasicInfoSection({ 
  title,
  setTitle,
  description,
  setDescription,
  difficulty,
  setDifficulty,
  target,
  setTarget,
  programType,
  setProgramType,
  focus,
  setFocus,
  rotationCycleLength,
  setRotationCycleLength
}: BasicInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <TextInput
        label={t('trainings.form.title')}
        placeholder={t('trainings.form.titlePlaceholder')}
        required
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />

      <Textarea
        label={t('trainings.form.description')}
        placeholder={t('trainings.form.descriptionPlaceholder')}
        required
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />

      <Grid gutter="md">
        <Grid.Col span={6}>
          <Select
            label={t('trainings.difficulty')}
            data={[
              { value: 'beginner', label: t('trainings.beginner') },
              { value: 'intermediate', label: t('trainings.intermediate') },
              { value: 'advanced', label: t('trainings.advanced') },
            ]}
            value={difficulty}
            onChange={(value) => setDifficulty(value as Difficulty)}
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Select
            label={t('trainings.form.fitnessGoal')}
            data={[
              { value: 'maintain', label: t('trainings.form.maintainWeight') },
              { value: 'cut', label: t('trainings.form.cutWeight') },
              { value: 'bulk', label: t('trainings.form.bulkWeight') },
            ]}
            value={target}
            onChange={(value) => setTarget(value as Target | undefined)}
            clearable
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={6}>
          <Select
            label={t('trainings.form.programType')}
            required
            data={[
              { value: 'fixedDays', label: t('trainings.form.fixedDays') },
              { value: 'rotation', label: t('trainings.form.rotation') },
            ]}
            value={programType as string}
            onChange={(value) => setProgramType(value as ProgramType)}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={programType === 'rotation' ? 8 : 12}>
          <TextInput
            label={t('trainings.focus')}
            required
            placeholder={t('trainings.form.focusPlaceholder')}
            value={focus}
            onChange={(e) => setFocus(e.currentTarget.value)}
          />
        </Grid.Col>

        <Activity mode={programType === 'rotation' ? "visible" : "hidden"}>
          <Grid.Col span={4}>
            <NumberInput
              label={t('trainings.form.rotationCycleLength')}
              placeholder={t('trainings.days')}
              value={rotationCycleLength ?? undefined}
              onChange={(value) => setRotationCycleLength(typeof value === 'number' ? value : undefined)}
            />
          </Grid.Col>
        </Activity>
      </Grid>
    </>
  );
}

import { TextInput, Textarea, Select, Grid, NumberInput } from '@mantine/core';
import type { Difficulty, ProgramType } from '../../../types/training-plan.types';

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  programType: ProgramType;
  setProgramType: (value: ProgramType) => void;
  focus: string;
  setFocus: (value: string) => void;
  rotationCycleLength: number | undefined | null;
  setRotationCycleLength: (value: number | undefined | null) => void;
}

export function BasicInfoSection({ 
  title,
  setTitle,
  description,
  setDescription,
  difficulty,
  setDifficulty,
  programType,
  setProgramType,
  focus,
  setFocus,
  rotationCycleLength,
  setRotationCycleLength
}: BasicInfoSectionProps) {

  return (
    <>
      <TextInput
        label="Title"
        placeholder="Enter training plan title"
        required
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />

      <Textarea
        label="Description"
        placeholder="Enter training plan description"
        required
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />

      <Grid gutter="md">
        <Grid.Col span={6}>
          <Select
            label="Difficulty"
            data={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={difficulty}
            onChange={(value) => setDifficulty(value as Difficulty)}
            required
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Select
            label="Program Type"
            required
            data={[
              { value: 'fixedDays', label: 'Fixed Days' },
              { value: 'rotation', label: 'Rotation' },
            ]}
            value={programType as string}
            onChange={(value) => setProgramType(value as ProgramType)}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={programType === 'rotation' ? 8 : 12}>
          <TextInput
            label="Focus"
            placeholder="e.g., Upper Body, Cardio, Full Body"
            value={focus}
            onChange={(e) => setFocus(e.currentTarget.value)}
          />
        </Grid.Col>

        {programType === 'rotation' && (
          <Grid.Col span={4}>
            <NumberInput
              label="Rotation Cycle Length"
              placeholder="Days"
              value={rotationCycleLength ?? undefined}
              onChange={(value) => setRotationCycleLength(typeof value === 'number' ? value : undefined)}
            />
          </Grid.Col>
        )}
      </Grid>
    </>
  );
}

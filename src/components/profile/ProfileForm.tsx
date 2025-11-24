import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import type { ProfileFormData } from '../../schemas/profile.schemas';
import { TextInput, PasswordInput, Select, Button, Stack, NumberInput, Grid, Paper, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

interface ProfileFormProps {
  errors: FieldErrors<ProfileFormData>;
  control: Control<ProfileFormData>;
  isGoogleAuth: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  errors,
  control,
  isGoogleAuth,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        Edit Profile
      </Title>

      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Full Name"
                    placeholder="John Doe"
                    required
                    {...field}
                    error={errors.fullName?.message}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Email"
                    placeholder="your@email.com"
                    required
                    readOnly={isGoogleAuth}
                    disabled={isGoogleAuth}
                    {...field}
                    error={errors.email?.message}
                    description={isGoogleAuth ? 'Email cannot be changed for Google accounts' : undefined}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => {
                  const dateValue = field.value ? new Date(field.value) : null;
                  return (
                    <DateInput
                      label="Birth Date"
                      placeholder="Pick date"
                      required
                      maxDate={new Date()}
                      value={dateValue}
                      onChange={(value) => field.onChange(value ? new Date(value).toISOString().split('T')[0] : null)}
                      error={errors.birthDate?.message}
                    />
                  );
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Gender"
                    placeholder="Select your gender"
                    required
                    data={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                    {...field}
                    error={errors.gender?.message}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="height"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <NumberInput
                    label="Height (cm)"
                    placeholder="170"
                    min={0}
                    value={value ?? ''}
                    onChange={onChange}
                    error={errors.height?.message}
                    {...field}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter new password"
                    disabled={isGoogleAuth}
                    {...field}
                    error={errors.password?.message}
                    description={isGoogleAuth ? 'Password cannot be changed for Google accounts' : 'Leave blank to keep current password'}
                  />
                )}
              />
            </Grid.Col>
          </Grid>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button
              type="button"
              variant="default"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              variant="gradient"
            >
              Save Changes
            </Button>
          </div>
        </Stack>
      </form>
    </Paper>
  );
};

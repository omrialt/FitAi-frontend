/**
 * Form handling types
 */

import type { FieldValues, DefaultValues, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

export interface UseFormHandlerOptions<TFormData extends FieldValues> {
  schema: z.ZodType<TFormData>;
  defaultValues?: DefaultValues<TFormData>;
  onSubmit: (data: TFormData) => Promise<void> | void;
  onError?: (error: unknown) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export type UseFormHandlerReturn<TFormData extends FieldValues> = Omit<
  UseFormReturn<TFormData>,
  'handleSubmit'
> & {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
};

export interface AxiosErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

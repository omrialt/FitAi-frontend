/**
 * useFormHandler Hook
 *
 * Generic form handling integrated with react-hook-form and Zod validation.
 * Provides type-safe forms with automatic validation and error handling.
 *
 * @example
 * ```tsx
 * const loginSchema = z.object({
 *   email: z.string().email('Invalid email'),
 *   password: z.string().min(6, 'Password must be at least 6 characters'),
 * });
 *
 * function LoginForm() {
 *   const { register, handleSubmit, formState: { errors, isSubmitting } } = useFormHandler({
 *     schema: loginSchema,
 *     onSubmit: async (data) => {
 *       await api.post('/auth/login', data);
 *       toast.success('Logged in successfully!');
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input {...register('email')} />
 *       {errors.email && <span>{errors.email.message}</span>}
 *
 *       <input type="password" {...register('password')} />
 *       {errors.password && <span>{errors.password.message}</span>}
 *
 *       <button type="submit" disabled={isSubmitting}>
 *         {isSubmitting ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */

import { useEffect, useMemo } from "react";
import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type {
  UseFormHandlerOptions,
  UseFormHandlerReturn,
  AxiosErrorResponse,
} from "../types/form.types";

/**
 * Schemas carry i18n keys (e.g. 'validation.passwordMin') as their messages so a
 * single schema instance can render in any language. This walks the resolver's
 * error tree and swaps each key for the translated string. Messages that aren't
 * known keys are returned unchanged by i18next, so plain text still works.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function translateErrors(errors: any, t: TFunction): any {
  if (!errors || typeof errors !== "object") return errors;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = Array.isArray(errors) ? [] : {};

  for (const [key, value] of Object.entries(errors)) {
    if (key === "message" && typeof value === "string") {
      out[key] = t(value);
    } else if (value && typeof value === "object") {
      out[key] = translateErrors(value, t);
    } else {
      out[key] = value;
    }
  }

  return out;
}

/**
 * Custom form handler hook with Zod validation
 * @param options - Configuration options including schema and callbacks
 * @returns Extended react-hook-form methods with custom handleSubmit
 */
export function useFormHandler<TFormData extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  showSuccessToast = false,
  successMessage = "Form submitted successfully",
  showErrorToast = true,
  mode = "onBlur",
}: UseFormHandlerOptions<TFormData>): UseFormHandlerReturn<TFormData> {
  const { t } = useTranslation();

  // `t` gets a new identity on language change, so this rebuilds with it and
  // already-visible errors re-render translated
  const resolver = useMemo(() => {
    // Type assertion needed due to Zod v4 compatibility with @hookform/resolvers v5
    // The resolver works correctly at runtime despite the type mismatch
    // @ts-expect-error - Zod v4 types don't match @hookform/resolvers v5 expectations, but runtime is compatible
    const baseResolver = zodResolver(schema);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (async (values: any, context: any, options: any) => {
      const result = await baseResolver(values, context, options);
      return { ...result, errors: translateErrors(result.errors, t) };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }, [schema, t]);

  const form = useForm<TFormData>({
    resolver,
    defaultValues,
    mode,
  });

  const {
    handleSubmit: rhfHandleSubmit,
    formState: { isSubmitting },
  } = form;

  const handleSubmit = rhfHandleSubmit(
    async (data) => {
      try {
        await onSubmit(data);

        if (showSuccessToast) {
          toast.success(successMessage);
        }
      } catch (error: unknown) {
        console.error("Form submission error:", error);

        if (showErrorToast) {
          const errorMessage = extractErrorMessage(error, t);
          toast.error(errorMessage);
        }

        if (onError) {
          onError(error);
        }
      }
    },
    (errors) => {
      console.error("Form validation errors:", errors);

      if (showErrorToast) {
        const firstError = Object.values(errors)[0];
        if (
          firstError &&
          "message" in firstError &&
          typeof firstError.message === "string"
        ) {
          toast.error(firstError.message);
        }
      }

      if (onError) {
        onError(errors);
      }
    }
  );

  return {
    ...form,
    handleSubmit,
    isSubmitting,
  };
}

/**
 * Extract error message from various error types (Axios, Error, unknown)
 */
function extractErrorMessage(error: unknown, t: TFunction): string {
  // Check if it's an Axios error
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AxiosErrorResponse | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  // Check if it's a standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return t("validation.submitFailed");
}

/**
 * useFormPersist Hook
 *
 * Automatically persists form data to localStorage and restores it on mount.
 * Useful for long forms where users might accidentally navigate away.
 *
 * @example
 * ```tsx
 * function LongForm() {
 *   const form = useFormHandler({ ... });
 *   useFormPersist('my-form-key', form);
 *
 *   return <form>...</form>;
 * }
 * ```
 */

export function useFormPersist<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  enabled: boolean = true
) {
  const { watch, reset } = form;

  // Load from localStorage on mount
  useEffect(() => {
    if (!enabled) return;

    const savedData = localStorage.getItem(key);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        reset(parsedData);
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
      }
    }
  }, [key, reset, enabled]);

  // Save to localStorage on change
  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((data: unknown) => {
      localStorage.setItem(key, JSON.stringify(data));
    });

    return () => subscription.unsubscribe();
  }, [key, watch, enabled]);

  // Clear localStorage helper
  const clearSaved = () => {
    localStorage.removeItem(key);
  };

  return { clearSaved };
}

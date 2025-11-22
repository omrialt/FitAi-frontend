/**
 * useApi Hook
 * 
 * Wrapper around axios with loading, error, and cancellation management.
 * Handles automatic error notifications and request cancellation on component unmount.
 * 
 * @example
 * ```tsx
 * function TrainingPlans() {
 *   const { data, loading, error, execute } = useApi<TrainingPlan[]>();
 * 
 *   useEffect(() => {
 *     execute('/training-plans');
 *   }, []);
 * 
 *   if (loading) return <Loader />;
 *   if (error) return <ErrorMessage message={error.message} />;
 * 
 *   return <PlansList plans={data} />;
 * }
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import type { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { toast } from 'sonner';
import api from '../services/api';
import type { ApiError } from '../types/api.types';

interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(options: UseApiOptions = {}): UseApiReturn<T> {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Request successful',
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  // Execute API request
  const execute = useCallback(async (
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<T | null> => {
    // Cancel previous request if exists
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('New request initiated');
    }

    // Create new cancel token
    cancelTokenSourceRef.current = axios.CancelToken.source();

    setLoading(true);
    setError(null);

    try {
      const response = await api.request<T>({
        url,
        ...config,
        cancelToken: cancelTokenSourceRef.current.token,
      });

      setData(response.data);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      return response.data;
    } catch (err: unknown) {
      // Don't handle cancelled requests
      if (axios.isCancel(err)) {
        return null;
      }

      const apiError: ApiError = {
        message: axios.isAxiosError(err) 
          ? (err.response?.data?.message || err.message || 'An error occurred')
          : 'An error occurred',
        statusCode: axios.isAxiosError(err) ? err.response?.status : undefined,
        errors: axios.isAxiosError(err) ? err.response?.data?.errors : undefined,
      };

      setError(apiError);

      if (showErrorToast) {
        toast.error(apiError.message);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [showErrorToast, showSuccessToast, successMessage]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cancel request on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * useApiMutation Hook
 * 
 * Similar to useApi but specifically for POST, PUT, PATCH, DELETE operations.
 * 
 * @example
 * ```tsx
 * function CreatePlan() {
 *   const { mutate, loading } = useApiMutation<TrainingPlan>({
 *     showSuccessToast: true,
 *     successMessage: 'Training plan created!',
 *   });
 * 
 *   const handleSubmit = async (data: TrainingPlanData) => {
 *     const result = await mutate('/training-plans', { method: 'POST', data });
 *     if (result) navigate('/plans');
 *   };
 * 
 *   return <PlanForm onSubmit={handleSubmit} loading={loading} />;
 * }
 * ```
 */

interface UseApiMutationReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

export function useApiMutation<T>(
  options: UseApiOptions = {}
): UseApiMutationReturn<T> {
  const { data, loading, error, execute, reset } = useApi<T>(options);

  const mutate = useCallback(
    async (url: string, config: AxiosRequestConfig = {}) => {
      return execute(url, { method: config.method || 'POST', ...config });
    },
    [execute]
  );

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

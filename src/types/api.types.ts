/**
 * API types for HTTP requests and responses
 */

import type { AxiosRequestConfig } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
}

export interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

export interface UseApiMutationReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (url: string, config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

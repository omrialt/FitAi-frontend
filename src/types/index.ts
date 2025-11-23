/**
 * Central export point for all type definitions
 * 
 * Import types from here for convenience:
 * import type { User, UploadedFile, UsePaginationOptions } from '@/types';
 */

// Auth types
export type {
  User,
  AuthTokens,
  UserRole,
} from './auth.types';

// API types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
} from './api.types';

// Upload types
export type {
  UploadProgress,
  UploadedFile,
  UploadError,
  UploadStatus,
  UseUploadOptions,
  UseUploadReturn,
} from './upload.types';

// Form types
export type {
  UseFormHandlerOptions,
  UseFormHandlerReturn,
  AxiosErrorResponse,
} from './form.types';

// Pagination types
export type {
  UsePaginationOptions,
  UsePaginationReturn,
  PaginationState,
} from './pagination.types';

// Storage types
export type {
  SetValue,
  StorageOptions,
} from './storage.types';

// Role/Permission types
export type {
  UseRoleGuardOptions,
  UseRoleGuardReturn,
  BasicUser,
} from './role.types';

// User types
export type {
  UpdateProfileDto,
  CreateUserDto,
  UserResponse,
} from './user.types';

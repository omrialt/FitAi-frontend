/**
 * Custom Hooks Index
 * 
 * Central export point for all custom hooks in the fitness application.
 * Import hooks from this file for cleaner imports throughout the app.
 * 
 * @example
 * ```tsx
 * import { useAuth, useApi, useFormHandler } from '@/hooks';
 * ```
 */

// Authentication
export { useAuth } from './useAuth';
export { useRoleGuard, usePermission, useFeatureFlag } from './useRoleGuard';

// API & Data Fetching
export { useApi, useApiMutation } from './useApi';

// Forms
export { useFormHandler, useFormPersist } from './useFormHandler';

// UI State
export { useToggle, useMultiToggle } from './useToggle';
export { useClickOutside, useClickInside, useFocusTrap } from './useClickOutside';

// Performance
export { useDebounce, useDebouncedCallback, useThrottle } from './useDebounce';

// File Upload
export { useUpload, useMultipleUpload } from './useUpload';

// Pagination
export { usePagination, useInfinitePagination } from './usePagination';

// Storage
export { useLocalStorage, useSessionStorage, useStorageState } from './useLocalStorage';

// Charts & Data Visualization
export { useChart, useProgressChart, useWorkoutChart } from './useChart';

// React 19 Features
export { useMetadata, usePresetMetadata } from './useMetadata';
export { useAuthContext, useOptionalAuth } from './useAuthContext';
export { useResourcePreload } from './useResourcePreload';

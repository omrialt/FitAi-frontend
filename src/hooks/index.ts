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

// API & Data Fetching
export { useApi, useApiMutation } from './useApi';

// Forms
export { useFormHandler, useFormPersist } from './useFormHandler';

// Performance
export { useDebounce, useDebouncedCallback, useThrottle } from './useDebounce';

// Export
export { useExport } from './useExport';
export { useNutritionExport } from './useNutritionExport';

// React 19 Features
export { useMetadata, usePresetMetadata } from './useMetadata';

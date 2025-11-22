/**
 * useLocalStorage Hook
 * 
 * Manage persistent localStorage state (theme, filters, temporary form data).
 * Automatically syncs across tabs and handles serialization/deserialization.
 * 
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('app-theme', 'light');
 * 
 *   return (
 *     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function WorkoutFilters() {
 *   const [filters, setFilters] = useLocalStorage('workout-filters', {
 *     difficulty: 'all',
 *     muscleGroup: 'all',
 *     duration: 'all',
 *   });
 * 
 *   return (
 *     <div>
 *       <select
 *         value={filters.difficulty}
 *         onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
 *       >
 *         <option value="all">All Difficulties</option>
 *         <option value="beginner">Beginner</option>
 *         <option value="intermediate">Intermediate</option>
 *         <option value="advanced">Advanced</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { SetValue } from '../types/storage.types';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // Get from localStorage or use initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Set value to localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(`Tried setting localStorage key "${key}" in non-browser environment`);
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        
        // Dispatch custom event for cross-tab synchronization
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(`Tried removing localStorage key "${key}" in non-browser environment`);
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    const handleLocalStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useSessionStorage Hook
 * 
 * Similar to useLocalStorage but uses sessionStorage (cleared when tab closes).
 * 
 * @example
 * ```tsx
 * function SearchResults() {
 *   const [searchQuery, setSearchQuery] = useSessionStorage('search-query', '');
 *   const [results, setResults] = useState([]);
 * 
 *   useEffect(() => {
 *     if (searchQuery) {
 *       api.get(`/search?q=${searchQuery}`).then(setResults);
 *     }
 *   }, [searchQuery]);
 * 
 *   return (
 *     <input
 *       value={searchQuery}
 *       onChange={(e) => setSearchQuery(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 */

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(`Tried setting sessionStorage key "${key}" in non-browser environment`);
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(`Tried removing sessionStorage key "${key}" in non-browser environment`);
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useStorageState Hook
 * 
 * Generic hook that works with any Storage API (localStorage, sessionStorage, or custom).
 * 
 * @example
 * ```tsx
 * const customStorage = {
 *   getItem: (key: string) => myCustomCache.get(key),
 *   setItem: (key: string, value: string) => myCustomCache.set(key, value),
 *   removeItem: (key: string) => myCustomCache.delete(key),
 * };
 * 
 * function Component() {
 *   const [value, setValue] = useStorageState('my-key', 'default', customStorage);
 *   return <div>{value}</div>;
 * }
 * ```
 */

interface StorageAPI {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export function useStorageState<T>(
  key: string,
  initialValue: T,
  storage: StorageAPI
): [T, SetValue<T>, () => void] {
  const readValue = useCallback((): T => {
    try {
      const item = storage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading storage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, storage]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        storage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting storage key "${key}":`, error);
      }
    },
    [key, storedValue, storage]
  );

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing storage key "${key}":`, error);
    }
  }, [key, initialValue, storage]);

  return [storedValue, setValue, removeValue];
}

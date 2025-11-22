/**
 * useDebounce Hook
 * 
 * Debounce any value or function (useful for search input, API calls, resize events).
 * Delays updating the value until after the user has stopped changing it.
 * 
 * @example
 * ```tsx
 * function SearchBar() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       // API call only happens after 500ms of no typing
 *       api.get(`/search?q=${debouncedSearch}`).then(setResults);
 *     }
 *   }, [debouncedSearch]);
 * 
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search training plans..."
 *     />
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay is reached
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback Hook
 * 
 * Debounce a callback function instead of a value.
 * Useful for expensive operations like API calls, validation, or complex calculations.
 * 
 * @example
 * ```tsx
 * function UserSearch() {
 *   const [users, setUsers] = useState([]);
 * 
 *   const searchUsers = useDebouncedCallback(
 *     async (query: string) => {
 *       const results = await api.get(`/users/search?q=${query}`);
 *       setUsers(results.data);
 *     },
 *     300
 *   );
 * 
 *   return (
 *     <input
 *       onChange={(e) => searchUsers(e.target.value)}
 *       placeholder="Search users..."
 *     />
 *   );
 * }
 * ```
 */

import { useRef, useCallback } from 'react';

type DebouncedFunction<T extends (...args: never[]) => unknown> = (
  ...args: Parameters<T>
) => void;

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number = 500
): DebouncedFunction<T> {
  const timeoutRef = useRef<number | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * useThrottle Hook
 * 
 * Similar to debounce but ensures the function is called at most once per interval.
 * Useful for scroll events, resize events, or rate-limiting API calls.
 * 
 * @example
 * ```tsx
 * function InfiniteScroll() {
 *   const handleScroll = useThrottle(() => {
 *     const scrollPosition = window.scrollY;
 *     const windowHeight = window.innerHeight;
 *     const documentHeight = document.documentElement.scrollHeight;
 * 
 *     if (scrollPosition + windowHeight >= documentHeight - 100) {
 *       loadMoreItems();
 *     }
 *   }, 200);
 * 
 *   useEffect(() => {
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, [handleScroll]);
 * 
 *   return <div>Content</div>;
 * }
 * ```
 */

export function useThrottle<T extends (...args: never[]) => unknown>(
  callback: T,
  limit: number = 500
): DebouncedFunction<T> {
  const inThrottle = useRef(false);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );

  return throttledCallback;
}

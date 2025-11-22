/**
 * usePagination Hook
 * 
 * Manage page, next, prev, total pages for tables or lists.
 * Works perfectly with @tanstack/react-table and custom pagination UIs.
 * 
 * @example
 * ```tsx
 * function TrainingPlansTable() {
 *   const [plans, setPlans] = useState([]);
 *   const {
 *     page,
 *     pageSize,
 *     totalPages,
 *     totalItems,
 *     setTotalItems,
 *     nextPage,
 *     prevPage,
 *     goToPage,
 *     canGoNext,
 *     canGoPrev,
 *     setPageSize,
 *     paginationState,
 *   } = usePagination({ initialPageSize: 10 });
 * 
 *   useEffect(() => {
 *     fetchPlans({ page, pageSize }).then((response) => {
 *       setPlans(response.data);
 *       setTotalItems(response.pagination.total);
 *     });
 *   }, [page, pageSize]);
 * 
 *   return (
 *     <div>
 *       <table>
 *         {plans.map(plan => <tr key={plan.id}>...</tr>)}
 *       </table>
 * 
 *       <div className="pagination">
 *         <button onClick={prevPage} disabled={!canGoPrev}>Previous</button>
 *         <span>Page {page} of {totalPages}</span>
 *         <button onClick={nextPage} disabled={!canGoNext}>Next</button>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  UsePaginationOptions,
  UsePaginationReturn,
  PaginationState,
} from '../types/pagination.types';

// Fallback toast implementation (replace with your toast library import if available)
// Example: import { toast } from 'react-hot-toast';
// Example: import { toast } from 'react-toastify';
const toast = { error: (message: string) => console.error(message) };

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems: initialTotalItems = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1;
  }, [totalItems, pageSize]);

  // Calculate start and end indices for current page
  const startIndex = useMemo(() => {
    return (page - 1) * pageSize;
  }, [page, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  // Navigation functions
  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPage(validPage);
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Can navigate flags
  const canGoNext = useMemo(() => page < totalPages, [page, totalPages]);
  const canGoPrev = useMemo(() => page > 1, [page]);

  // React-table integration
  const paginationState = useMemo<PaginationState>(
    () => ({
      pageIndex: page - 1, // react-table uses 0-based indexing
      pageSize,
    }),
    [page, pageSize]
  );

  const setPagination = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newState = typeof updater === 'function' ? updater(paginationState) : updater;
      setPage(newState.pageIndex + 1); // Convert back to 1-based
      setPageSizeState(newState.pageSize);
    },
    [paginationState]
  );

  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    setTotalItems,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    canGoNext,
    canGoPrev,
    paginationState,
    setPagination,
  };
}

/**
 * useInfinitePagination Hook
 * 
 * For infinite scroll or "load more" patterns.
 * 
 * @example
 * ```tsx
 * function InfiniteWorkoutList() {
 *   const [workouts, setWorkouts] = useState<Workout[]>([]);
 *   const { page, hasMore, loadMore, loading, reset } = useInfinitePagination({
 *     pageSize: 20,
 *     onLoadMore: async (page) => {
 *       const response = await api.get(`/workouts?page=${page}&limit=20`);
 *       return {
 *         items: response.data,
 *         hasMore: response.data.length === 20,
 *       };
 *     },
 *     onSuccess: (newItems) => {
 *       setWorkouts(prev => [...prev, ...newItems]);
 *     },
 *   });
 * 
 *   return (
 *     <div>
 *       {workouts.map(workout => <WorkoutCard key={workout.id} {...workout} />)}
 *       {hasMore && (
 *         <button onClick={loadMore} disabled={loading}>
 *           {loading ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

interface UseInfinitePaginationOptions<T> {
  pageSize: number;
  onLoadMore: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  onSuccess?: (items: T[]) => void;
  onError?: (error: Error) => void;
}

interface UseInfinitePaginationReturn {
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useInfinitePagination<T = unknown>(
  options: UseInfinitePaginationOptions<T>
): UseInfinitePaginationReturn {
  const { onLoadMore, onSuccess, onError } = options;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onLoadMore(page);
      
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);

      if (onSuccess) {
        onSuccess(result.items);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more');
      setError(error);

      if (onError) {
        onError(error);
      }

      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, onLoadMore, onSuccess, onError]);

  const reset = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setError(null);
  }, []);

  return {
    page,
    hasMore,
    loading,
    error,
    loadMore,
    reset,
  };
}

/**
 * Helpers for API values that may arrive wrapped or populated, shared by the
 * dashboard and the "today's workout" redirect.
 */

/** Unwrap the TransformInterceptor envelope `{ data, timestamp, path }` when present. */
export function unwrapResponse<T>(val: unknown): T | null {
  if (
    val &&
    typeof val === 'object' &&
    'timestamp' in (val as Record<string, unknown>) &&
    'data' in (val as Record<string, unknown>)
  ) {
    return (val as Record<string, unknown>).data as T;
  }
  return (val as T) ?? null;
}

/** The id of a ref the backend may or may not have populated. */
export function refId(ref: unknown): string | null {
  if (typeof ref === 'string') return ref;
  if (ref && typeof ref === 'object' && '_id' in (ref as Record<string, unknown>)) {
    return String((ref as { _id: unknown })._id);
  }
  return null;
}

export function isPopulated<T>(ref: unknown): ref is T {
  return !!ref && typeof ref === 'object' && '_id' in (ref as Record<string, unknown>);
}

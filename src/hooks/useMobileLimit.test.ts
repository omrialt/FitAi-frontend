import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useMobileLimit } from './useMobileLimit';
import { isStale, STATS_STALE_MS } from './useDashboard';

const mobile = vi.hoisted(() => ({ value: true }));
vi.mock('./useIsMobile', () => ({ useIsMobile: () => mobile.value }));

const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

describe('useMobileLimit', () => {
  beforeEach(() => {
    mobile.value = true;
  });

  it('caps the list on phones and reports how many rows are held back', () => {
    const { result } = renderHook(() => useMobileLimit(items));
    expect(result.current.visible).toEqual(['a', 'b', 'c']);
    expect(result.current.hidden).toBe(5);
  });

  it('shows everything once expanded', () => {
    const { result } = renderHook(() => useMobileLimit(items));
    act(() => result.current.expand());
    expect(result.current.visible).toEqual(items);
    expect(result.current.hidden).toBe(0);
  });

  it('never caps on desktop', () => {
    mobile.value = false;
    const { result } = renderHook(() => useMobileLimit(items));
    expect(result.current.visible).toEqual(items);
    expect(result.current.hidden).toBe(0);
  });

  it('offers no button when the list already fits', () => {
    const { result } = renderHook(() => useMobileLimit(['a', 'b', 'c']));
    expect(result.current.hidden).toBe(0);
  });
});

describe('isStale', () => {
  const now = Date.parse('2026-10-15T12:00:00.000Z');

  it('keeps a snapshot younger than the threshold', () => {
    expect(isStale(new Date(now - STATS_STALE_MS + 1000).toISOString(), now)).toBe(false);
  });

  it('refreshes a snapshot older than the threshold', () => {
    expect(isStale(new Date(now - STATS_STALE_MS - 1000).toISOString(), now)).toBe(true);
  });

  it('treats a missing or unparseable timestamp as stale', () => {
    expect(isStale(undefined, now)).toBe(true);
    expect(isStale('not a date', now)).toBe(true);
  });
});

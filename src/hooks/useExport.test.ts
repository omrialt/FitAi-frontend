import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { TrainingPlan } from '../types/training-plan.types';

let native = false;
vi.mock('../config/platform', () => ({
  get isNativeApp() {
    return native;
  },
}));

const shareFile = vi.fn();
vi.mock('../services/share-file', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/share-file')>()),
  shareFile: (...args: unknown[]) => shareFile(...args),
}));

// jsdom cannot download; only whether the browser path was taken matters.
const writeFile = vi.fn();
vi.mock('xlsx', async (importOriginal) => ({
  ...(await importOriginal<typeof import('xlsx')>()),
  writeFile: (...args: unknown[]) => writeFile(...args),
}));

import { useExport } from './useExport';

// The slash once failed the whole Excel export (sheet names refuse it).
const plan = {
  _id: 'p1',
  title: 'Push / Pull / Legs',
  days: [],
} as unknown as TrainingPlan;

describe('useExport (Excel)', () => {
  beforeEach(() => {
    shareFile.mockReset().mockResolvedValue(undefined);
    writeFile.mockReset();
  });

  it('downloads in the browser, exactly as before', async () => {
    native = false;
    const { result } = renderHook(() => useExport({ filename: 'plans' }));

    await act(() => result.current.exportToExcel([plan]));

    expect(writeFile).toHaveBeenCalledWith(expect.anything(), expect.stringMatching(/^plans_\d+\.xlsx$/));
    expect(shareFile).not.toHaveBeenCalled();
  });

  // The app's WebView has no downloads.
  it('goes to the share sheet in the app', async () => {
    native = true;
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useExport({ filename: 'plans', onSuccess }));

    await act(() => result.current.exportToExcel([plan]));

    expect(writeFile).not.toHaveBeenCalled();
    expect(shareFile).toHaveBeenCalledWith(
      expect.stringMatching(/^plans_\d+\.xlsx$/),
      expect.stringMatching(/^[A-Za-z0-9+/]+=*$/),
      expect.any(String),
    );
    expect(onSuccess).toHaveBeenCalled();
  });
});

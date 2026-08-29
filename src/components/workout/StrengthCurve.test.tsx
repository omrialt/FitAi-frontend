import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StrengthCurve } from './StrengthCurve';
import { workoutSessionService } from '../../services/workout-session.service';
import type { ExerciseHistory } from '../../types/workout-session.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../../services/workout-session.service', () => ({
  workoutSessionService: { getExerciseHistory: vi.fn() },
}));

const history = (over: Partial<ExerciseHistory> = {}): ExerciseHistory => ({
  exercise: 'Bench Press',
  availableExercises: ['Back Squat', 'Bench Press'],
  points: [
    {
      date: '2026-07-14',
      weight: 57.5,
      reps: 8,
      estimatedOneRepMax: 72.8,
      volume: 1260,
      sets: 3,
      isPersonalBest: true,
    },
    {
      date: '2026-08-08',
      weight: 70,
      reps: 10,
      estimatedOneRepMax: 93.3,
      volume: 5080,
      sets: 8,
      isPersonalBest: true,
    },
  ],
  ...over,
});

describe('StrengthCurve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workoutSessionService.getExerciseHistory).mockResolvedValue(
      history(),
    );
  });

  it('adopts the exercise the server resolved when none was given', async () => {
    render(<StrengthCurve userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Bench Press');
    });
  });

  it('reports the change across the window', async () => {
    render(<StrengthCurve userId="user-1" />);

    // 93.3 - 72.8 = 20.5
    expect(
      await screen.findByText(/workout\.curveGain.*"amount":20\.5/),
    ).toBeInTheDocument();
  });

  it('reports a decline as a loss, not a negative gain', async () => {
    vi.mocked(workoutSessionService.getExerciseHistory).mockResolvedValue(
      history({
        points: [
          { date: '2026-07-14', weight: 80, reps: 5, estimatedOneRepMax: 93.3, volume: 1200, sets: 3, isPersonalBest: true },
          { date: '2026-08-08', weight: 70, reps: 5, estimatedOneRepMax: 72.8, volume: 1050, sets: 3, isPersonalBest: false },
        ],
      }),
    );

    render(<StrengthCurve userId="user-1" />);

    expect(
      await screen.findByText(/workout\.curveLoss.*"amount":20\.5/),
    ).toBeInTheDocument();
  });

  // A single point is a dot, not a trend — the summary line must not claim one.
  it('survives a single data point without claiming a trend', async () => {
    vi.mocked(workoutSessionService.getExerciseHistory).mockResolvedValue(
      history({ points: [history().points[0]] }),
    );

    render(<StrengthCurve userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('Bench Press');
    });
    expect(screen.queryByText(/workout\.curveGain/)).not.toBeInTheDocument();
    expect(screen.queryByText(/workout\.curveLoss/)).not.toBeInTheDocument();
  });

  it('shows an empty state rather than a blank panel', async () => {
    vi.mocked(workoutSessionService.getExerciseHistory).mockResolvedValue(
      history({ points: [], exercise: '', availableExercises: [] }),
    );

    render(<StrengthCurve userId="user-1" />);

    expect(await screen.findByText('workout.curveEmpty')).toBeInTheDocument();
  });

  it('shows a failure state when the request fails', async () => {
    vi.mocked(workoutSessionService.getExerciseHistory).mockRejectedValue(
      new Error('500'),
    );

    render(<StrengthCurve userId="user-1" />);

    expect(await screen.findByText('workout.curveFailed')).toBeInTheDocument();
  });

  it('opens on the exercise it was pointed at', async () => {
    render(<StrengthCurve userId="user-1" initialExercise="Back Squat" />);

    await waitFor(() => {
      expect(workoutSessionService.getExerciseHistory).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ name: 'Back Squat' }),
      );
    });
  });

  it('re-queries when the window changes, keeping the exercise', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<StrengthCurve userId="user-1" />);
    await screen.findByText('workout.strengthCurve');

    await user.click(screen.getByText('workout.windowAll'));

    await waitFor(() => {
      expect(workoutSessionService.getExerciseHistory).toHaveBeenLastCalledWith(
        'user-1',
        // 0 days means all time, and must be sent as "no window" not as 0.
        expect.objectContaining({ name: 'Bench Press', days: undefined }),
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { OverloadCard } from './OverloadCard';
import { DeloadCard } from './DeloadCard';
import { workoutSessionService } from '../../services/workout-session.service';
import type {
  DeloadPrescription,
  OverloadPlan,
  OverloadSuggestion,
} from '../../types/workout-session.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../../services/workout-session.service', () => ({
  workoutSessionService: { getOverload: vi.fn(), getDeload: vi.fn() },
}));

const suggestion = (
  over: Partial<OverloadSuggestion> = {},
): OverloadSuggestion => ({
  exercise: 'Bench Press',
  lastPerformedAt: '2026-09-01',
  lastTopSet: { weight: 80, reps: 8, sets: 3 },
  repRange: { min: 5, max: 8 },
  action: 'add_weight',
  reason: 'range_topped',
  suggested: { weight: 82.5, reps: 5, sets: 3 },
  incrementKg: 2.5,
  equipment: 'barbell',
  lastRpe: null,
  ...over,
});

const plan = (over: Partial<OverloadPlan> = {}): OverloadPlan => ({
  suggestions: [suggestion()],
  deloadRecommended: false,
  ...over,
});

const prescription = (
  over: Partial<DeloadPrescription> = {},
): DeloadPrescription => ({
  recommended: true,
  level: 'deload',
  reasons: ['volume_dropping', 'effort_climbing'],
  loadPercent: 80,
  volumePercent: 60,
  durationDays: 7,
  exercises: [
    {
      exercise: 'Back Squat',
      from: { weight: 100, sets: 4, reps: 5 },
      to: { weight: 80, sets: 2, reps: 5 },
    },
  ],
  ...over,
});

describe('OverloadCard', () => {
  beforeEach(() => {
    // `restoreMocks` does not reset a vi.fn() created inside a vi.mock factory.
    vi.clearAllMocks();
    vi.mocked(workoutSessionService.getOverload).mockResolvedValue(plan());
  });

  it('shows the target and the evidence behind it', async () => {
    render(<OverloadCard userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/workout.overloadTarget:.*"weight":82\.5/),
    ).toBeInTheDocument();
    // A suggestion the user cannot check is a suggestion they cannot trust.
    expect(
      screen.getByText(/workout.overloadReason_range_topped/),
    ).toBeInTheDocument();
  });

  /**
   * The deload warning is rendered once above the list rather than repeated on
   * every row — the user deserves the reason before four identical "hold"s,
   * not four times inside them.
   */
  it('explains a deload once, not per row', async () => {
    vi.mocked(workoutSessionService.getOverload).mockResolvedValue(
      plan({
        deloadRecommended: true,
        suggestions: [
          suggestion({ action: 'hold', reason: 'deloading' }),
          suggestion({
            exercise: 'Back Squat',
            action: 'hold',
            reason: 'deloading',
          }),
        ],
      }),
    );

    render(<OverloadCard userId="user-1" />);

    await waitFor(() => {
      expect(
        screen.getByText('workout.overloadDeloading'),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText('workout.overloadDeloading')).toHaveLength(1);
    expect(
      screen.getAllByText('workout.overloadAction_hold'),
    ).toHaveLength(2);
  });

  // "0 kg x 9" is not a thing you can do.
  it('states a bodyweight target in reps alone', async () => {
    vi.mocked(workoutSessionService.getOverload).mockResolvedValue(
      plan({
        suggestions: [
          suggestion({
            exercise: 'Pull Up',
            incrementKg: 0,
            equipment: 'bodyweight',
            action: 'add_reps',
            suggested: { weight: 0, reps: 9, sets: 3 },
          }),
        ],
      }),
    );

    render(<OverloadCard userId="user-1" />);

    await waitFor(() => {
      expect(
        screen.getByText(/workout.overloadTargetReps/),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/overloadTarget:/)).not.toBeInTheDocument();
  });

  // Supporting information, never a reason to break the page around it.
  it('renders nothing at all when there is nothing to suggest', async () => {
    vi.mocked(workoutSessionService.getOverload).mockResolvedValue(
      plan({ suggestions: [] }),
    );

    const { container } = render(<OverloadCard userId="user-1" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('renders nothing when the request fails', async () => {
    vi.mocked(workoutSessionService.getOverload).mockRejectedValue(
      new Error('offline'),
    );

    const { container } = render(<OverloadCard userId="user-1" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe('DeloadCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workoutSessionService.getDeload).mockResolvedValue(
      prescription(),
    );
  });

  it('shows the current load next to the prescribed one', async () => {
    render(<DeloadCard userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Back Squat')).toBeInTheDocument();
    });

    // Both numbers: showing only the target would make the user work out what
    // changed, which is the one thing the card exists to tell them.
    expect(
      screen.getByText(/deloadSetLine:.*"weight":100/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/deloadSetLine:.*"weight":80/),
    ).toBeInTheDocument();
  });

  /** The difference between an alarm and an option. */
  it('offers a watch-level week without recommending it', async () => {
    vi.mocked(workoutSessionService.getDeload).mockResolvedValue(
      prescription({
        recommended: false,
        level: 'watch',
        loadPercent: 90,
        volumePercent: 80,
      }),
    );

    render(<DeloadCard userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText(/deloadOptional/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/deloadRecommended/)).not.toBeInTheDocument();
  });

  /**
   * `insufficient` is every user until RPE accrues. A card saying "not enough
   * data to tell you to rest" is the filler the fatigue detector exists to
   * avoid.
   */
  it('says nothing while the log cannot support a verdict', async () => {
    vi.mocked(workoutSessionService.getDeload).mockResolvedValue(
      prescription({
        recommended: false,
        level: 'insufficient',
        reasons: [],
        exercises: [],
      }),
    );

    const { container } = render(<DeloadCard userId="user-1" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

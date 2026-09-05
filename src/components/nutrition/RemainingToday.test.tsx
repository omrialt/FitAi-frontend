import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { RemainingToday } from './RemainingToday';
import { mealLogService } from '../../services/meal-log.service';
import type { DailyIntake } from '../../types/meal-log.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../../services/meal-log.service', async () => {
  const actual = await vi.importActual<typeof import('../../services/meal-log.service')>(
    '../../services/meal-log.service',
  );
  return {
    ...actual,
    mealLogService: { getDay: vi.fn(), remove: vi.fn(), create: vi.fn(), list: vi.fn() },
  };
});

const intake = (over: Partial<DailyIntake> = {}): DailyIntake => ({
  localDay: '2026-09-05',
  meals: [
    {
      id: 'm1',
      localDay: '2026-09-05',
      loggedAt: '2026-09-05T12:00:00Z',
      mealType: 'lunch',
      source: 'manual',
      label: null,
      foods: [],
      notes: null,
      totals: { calories: 800, protein: 60, carbs: 70, fat: 20 },
    },
  ],
  consumed: { calories: 800, protein: 60, carbs: 70, fat: 20 },
  target: { calories: 2000, protein: 150, carbs: 200, fat: 60 },
  remaining: { calories: 1200, protein: 90, carbs: 130, fat: 40 },
  planId: 'p1',
  planTitle: 'Cut — 2000',
  calorieTargetMismatch: null,
  ...over,
});

describe('RemainingToday', () => {
  beforeEach(() => {
    // restoreMocks does not reset a vi.fn() made in a vi.mock factory.
    vi.clearAllMocks();
    vi.mocked(mealLogService.getDay).mockResolvedValue(intake());
  });

  it('shows consumed against target, and what is left', async () => {
    render(<RemainingToday />);

    await waitFor(() =>
      expect(screen.getByText('mealLog.remainingTitle')).toBeInTheDocument(),
    );

    expect(
      screen.getByText(/ofTarget:.*"consumed":800.*"target":2000/),
    ).toBeInTheDocument();
    expect(screen.getByText(/left:.*"amount":1200/)).toBeInTheDocument();
  });

  /**
   * The clamping decision, rendered. "Exactly on target" and "300 over" must
   * not look the same, so an exceeded target reads as `over`, never as `left: 0`.
   */
  it('reports going over rather than clamping at zero', async () => {
    vi.mocked(mealLogService.getDay).mockResolvedValue(
      intake({
        consumed: { calories: 2300, protein: 170, carbs: 210, fat: 70 },
        remaining: { calories: -300, protein: -20, carbs: -10, fat: -10 },
      }),
    );

    render(<RemainingToday />);

    await waitFor(() =>
      expect(screen.getByText(/over:.*"amount":300/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/left:.*"amount":-/)).not.toBeInTheDocument();
  });

  /**
   * No plan means no target — not a zero target. The card drops to "consumed"
   * and shows no bars and no remaining figures at all.
   */
  it('shows consumed only when no plan is active', async () => {
    vi.mocked(mealLogService.getDay).mockResolvedValue(
      intake({ target: null, remaining: null, planId: null, planTitle: null }),
    );

    render(<RemainingToday />);

    await waitFor(() =>
      expect(screen.getByText('mealLog.consumedTitle')).toBeInTheDocument(),
    );
    expect(screen.getByText('mealLog.noTargetSubtitle')).toBeInTheDocument();
    expect(screen.queryByText(/mealLog.left:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/mealLog.over:/)).not.toBeInTheDocument();
  });

  // Decision 1 made visible rather than resolved silently.
  it('surfaces a plan whose declared calories disagree with its foods', async () => {
    vi.mocked(mealLogService.getDay).mockResolvedValue(
      intake({ calorieTargetMismatch: { declared: 1500, summed: 2000 } }),
    );

    render(<RemainingToday />);

    await waitFor(() =>
      expect(
        screen.getByText(/targetMismatch:.*"declared":1500.*"summed":2000/),
      ).toBeInTheDocument(),
    );
  });

  // Absent, not apologetic — same rule as the fatigue card.
  it('renders nothing when nothing is logged and no plan is active', async () => {
    vi.mocked(mealLogService.getDay).mockResolvedValue(
      intake({
        meals: [],
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        target: null,
        remaining: null,
      }),
    );

    const { container } = render(<RemainingToday />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('renders nothing when the request fails', async () => {
    vi.mocked(mealLogService.getDay).mockRejectedValue(new Error('offline'));

    const { container } = render(<RemainingToday />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('lists the day’s meals and re-reads after deleting one', async () => {
    vi.mocked(mealLogService.remove).mockResolvedValue(undefined);

    render(<RemainingToday showMeals />);

    await waitFor(() =>
      expect(screen.getByText('mealLog.loggedToday')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText('common.delete'));

    await waitFor(() => {
      expect(mealLogService.remove).toHaveBeenCalledWith('m1');
      // Re-read rather than patched in place, so the totals cannot drift.
      expect(mealLogService.getDay).toHaveBeenCalledTimes(2);
    });
  });

  it('does not list meals on the dashboard card', async () => {
    render(<RemainingToday />);

    await waitFor(() =>
      expect(screen.getByText('mealLog.remainingTitle')).toBeInTheDocument(),
    );
    expect(screen.queryByText('mealLog.loggedToday')).not.toBeInTheDocument();
  });
});

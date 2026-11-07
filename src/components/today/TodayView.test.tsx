import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', dir: () => 'ltr' },
  }),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

// The coach cards fetch on their own; they are not what is under test here.
vi.mock('../workout/DeloadCard', () => ({ DeloadCard: () => null }));
vi.mock('../workout/OverloadCard', () => ({ OverloadCard: () => null }));

const getDay = vi.fn();
vi.mock('../../services/meal-log.service', async (orig) => ({
  ...(await orig<typeof import('../../services/meal-log.service')>()),
  mealLogService: { getDay: (...a: unknown[]) => getDay(...a) },
}));

import { TodayView } from './TodayView';
import type { TrainingPlan } from '../../types/training-plan.types';

const today = new Date().getDay();
const set = { targetReps: 8, targetWeight: 50, history: [] };
const plan = (dayOfWeek: number) =>
  ({
    _id: 'p1',
    title: 'Strength',
    days: [
      {
        dayName: 'Upper A',
        dayOfWeek,
        exercises: [{ name: 'Bench', muscleGroup: 'chest', type: 'regular', sets: [set, set, set] }],
      },
    ],
  }) as unknown as TrainingPlan;

const intake = {
  localDay: '2026-11-07',
  meals: [
    {
      id: 'm1',
      localDay: '2026-11-07',
      loggedAt: new Date().toISOString(),
      mealType: 'breakfast',
      source: 'manual',
      label: null,
      foods: [{ name: 'Oats', calories: 540, protein: 30, carbs: 70, fat: 10 }],
      notes: null,
      totals: { calories: 540, protein: 30, carbs: 70, fat: 10 },
    },
  ],
  consumed: { calories: 540, protein: 30, carbs: 70, fat: 10 },
  target: { calories: 2300, protein: 180, carbs: 240, fat: 70 },
  remaining: { calories: 1760, protein: 150, carbs: 170, fat: 60 },
  planId: null,
  planTitle: null,
  calorieTargetMismatch: null,
};

function renderToday(p: TrainingPlan | null) {
  return render(
    <TodayView
      userId="u1"
      fullName="Yoni Levi"
      plan={p}
      planReady
      currentStatus={null}
      latestPhysicalData={null}
    />,
  );
}

describe('TodayView', () => {
  beforeEach(() => {
    navigate.mockReset();
    getDay.mockResolvedValue(intake);
  });

  it('puts today\'s workout first, with one primary action that starts it', async () => {
    renderToday(plan(today));
    expect(screen.getByText('today.todaysWorkout')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /today\.start/ }));
    expect(navigate).toHaveBeenCalledWith('/workout/p1/0');
  });

  it('on a rest day points at the next workout and offers to train anyway', () => {
    renderToday(plan((today + 2) % 7));
    expect(screen.getByText('today.summaryRest')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /today\.trainAnyway/ })).toBeInTheDocument();
  });

  it('invites a new athlete to pick a plan instead of showing an empty card', () => {
    renderToday(null);
    expect(screen.getByText('today.noPlanTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'today.choosePlan' })).toBeInTheDocument();
  });

  it('shows calories left and today\'s meals on the timeline', async () => {
    renderToday(plan(today));
    await waitFor(() => expect(screen.getByText('1,760')).toBeInTheDocument());
    expect(screen.getByText('Oats')).toBeInTheDocument();
  });

  it('opens the meal sheet from the timeline rather than leaving the screen', async () => {
    const opened = vi.fn();
    window.addEventListener('fitai:open-meal-sheet', opened);
    renderToday(plan(today));
    await userEvent.click(screen.getByRole('button', { name: /today\.logMeal/ }));
    expect(opened).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    window.removeEventListener('fitai:open-meal-sheet', opened);
  });
});

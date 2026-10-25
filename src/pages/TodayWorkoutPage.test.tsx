import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render as rtlRender, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'he' } }),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

const toastInfo = vi.fn();
vi.mock('sonner', () => ({ toast: { info: (...args: unknown[]) => toastInfo(...args) } }));

vi.mock('../store/authStore', () => ({
  useAuthStore: (select: (state: { user: { _id: string } }) => unknown) =>
    select({ user: { _id: 'user-1' } }),
}));

const getStatus = vi.fn();
vi.mock('../services/current-status.service', () => ({
  currentStatusService: { getByUserId: (...args: unknown[]) => getStatus(...args) },
}));
const getPlan = vi.fn();
vi.mock('../services/training-plan.service', () => ({
  trainingPlanService: { getById: (...args: unknown[]) => getPlan(...args) },
}));

import TodayWorkoutPage from './TodayWorkoutPage';

const render = (ui: ReactElement) => rtlRender(<MantineProvider>{ui}</MantineProvider>);

const PLAN_ID = 'a'.repeat(24);
// 2026-10-26 is a Monday (dayOfWeek 1).
const plan = {
  _id: PLAN_ID,
  days: [
    { dayName: 'Push', dayOfWeek: 0, exercises: [] },
    { dayName: 'Pull', dayOfWeek: 1, exercises: [] },
  ],
};

describe('TodayWorkoutPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-26T08:00:00'));
    navigate.mockClear();
    toastInfo.mockClear();
    getStatus.mockReset();
    getPlan.mockReset();
  });

  afterEach(() => vi.useRealTimers());

  it("opens today's day of the active plan", async () => {
    getStatus.mockResolvedValue({ activeTrainingPlanId: plan });
    render(<TodayWorkoutPage />);

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(`/workout/${PLAN_ID}/1`, { replace: true }),
    );
  });

  it('loads the plan by id when the status is not populated', async () => {
    getStatus.mockResolvedValue({ data: { activeTrainingPlanId: PLAN_ID }, timestamp: 1 });
    getPlan.mockResolvedValue(plan);
    render(<TodayWorkoutPage />);

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(`/workout/${PLAN_ID}/1`, { replace: true }),
    );
    expect(getPlan).toHaveBeenCalledWith(PLAN_ID);
  });

  it('says it is a rest day instead of opening the wrong day', async () => {
    getStatus.mockResolvedValue({
      activeTrainingPlanId: { ...plan, days: [{ dayName: 'Push', dayOfWeek: 3, exercises: [] }] },
    });
    render(<TodayWorkoutPage />);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(toastInfo).toHaveBeenCalledWith('dashboard.restDay');
  });

  it('says there is no active plan', async () => {
    getStatus.mockResolvedValue({ activeTrainingPlanId: null });
    render(<TodayWorkoutPage />);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(toastInfo).toHaveBeenCalledWith('dashboard.noActiveTrainingPlan');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import WorkoutSessionPage from './WorkoutSessionPage';
import { trainingPlanService } from '../services/training-plan.service';
import { workoutSessionService } from '../services/workout-session.service';

/**
 * The screen the Tier 2 round was built around, tested through what it
 * renders.
 *
 * Both bugs that reached production came from here and neither was visible to
 * a unit test: the plate calculator defaulted to "no bar" and so drew nothing,
 * and the draft could only be judged by opening the page. Everything below is
 * an assertion about what a user actually sees.
 *
 * Clicks go through `fireEvent` rather than `userEvent`: the latter's
 * synthetic pointer sequence does not reach this page's handlers under React
 * 19 with the compiler transform, and these tests are about what the screen
 * does with a click, not about fidelity of input simulation. `selectOptions`
 * still uses `userEvent`, where it works.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/workout/RestTimer', () => ({
  RestTimer: () => null,
}));

vi.mock('../services/training-plan.service', () => ({
  trainingPlanService: { getById: vi.fn() },
}));

vi.mock('../services/workout-session.service', () => ({
  workoutSessionService: { create: vi.fn() },
}));

vi.mock('../services/progress-stats.service', () => ({
  progressStatsService: { recalculate: vi.fn().mockResolvedValue(undefined) },
}));

// The swap control probes the catalogue on mount; an unrecognised name hides
// it, which is the right default for a test focused on the logger itself.
vi.mock('../services/exercise.service', () => ({
  exerciseService: {
    substitutes: vi.fn().mockResolvedValue({ matched: null, alternatives: [] }),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({ user: { _id: 'user-1' } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const PLAN = {
  _id: 'plan-1',
  title: 'Upper / Lower Split',
  days: [
    {
      dayName: 'Upper A',
      exercises: [
        {
          name: 'Bench Press',
          muscleGroup: 'chest',
          sets: [
            { targetReps: 8, targetWeight: 60 },
            { targetReps: 8, targetWeight: 62.5 },
          ],
        },
      ],
    },
  ],
};

const DRAFT_KEY = 'fitai-workout-draft:plan-1:0';

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={['/workout/plan-1/0']}>
        <Routes>
          <Route
            path="/workout/:planId/:dayIndex"
            element={<WorkoutSessionPage />}
          />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('WorkoutSessionPage', () => {
  beforeEach(() => {
    localStorage.clear();
    // `restoreMocks` does not reset the `vi.fn()`s created inside module
    // factories, so without this a call from one test is still on the counter
    // during the next and assertions pass or fail for the wrong reason.
    vi.clearAllMocks();
    vi.mocked(trainingPlanService.getById).mockResolvedValue(
      PLAN as unknown as Awaited<ReturnType<typeof trainingPlanService.getById>>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the plan day and its sets', async () => {
    renderPage();

    expect(await screen.findByText('Upper A')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  /**
   * The regression that shipped.
   *
   * `Number(localStorage.getItem(k))` is 0 for an absent key and 0 is a valid
   * "no bar", so a first-time user saw no plates at all — the whole feature,
   * invisible, with every unit test passing.
   */
  it('shows the plate breakdown on a fresh install, with no stored bar', async () => {
    renderPage();
    await screen.findByText('Bench Press');

    expect(screen.getAllByText('workout.perSide').length).toBeGreaterThan(0);
    // 60kg on the default 20kg bar is 20 a side.
    expect(screen.getAllByText('20').length).toBeGreaterThan(0);
  });

  it('drops the plate breakdown when the bar is set to none', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderPage();
    await screen.findByText('Bench Press');

    await user.selectOptions(
      screen.getByRole('combobox', { name: /barWeight|workout.barWeight/i }),
      '0',
    );

    await waitFor(() => {
      expect(screen.queryByText('workout.perSide')).not.toBeInTheDocument();
    });
  });

  it('offers a stored draft instead of applying it', async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        startedAt: Date.now() - 12 * 60_000,
        notes: '',
        exercises: [
          {
            name: 'Bench Press',
            muscleGroup: 'chest',
            sets: [
              { targetReps: 8, targetWeight: 60, reps: '8', weight: '60', rpe: '8.5', done: true },
              { targetReps: 8, targetWeight: 62.5, reps: '', weight: '', rpe: '', done: false },
            ],
          },
        ],
      }),
    );

    renderPage();

    expect(await screen.findByText('workout.resumeTitle')).toBeInTheDocument();
    // Offered, not applied: the counter still reads a fresh session.
    expect(screen.getByText(/0\/2/)).toBeInTheDocument();
  });

  it('restores the sets, the RPE and the original clock when resumed', async () => {
    const startedAt = Date.now() - 12 * 60_000;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        startedAt,
        notes: 'felt heavy',
        exercises: [
          {
            name: 'Bench Press',
            muscleGroup: 'chest',
            sets: [
              { targetReps: 8, targetWeight: 60, reps: '8', weight: '60', rpe: '8.5', done: true },
              { targetReps: 8, targetWeight: 62.5, reps: '', weight: '', rpe: '', done: false },
            ],
          },
        ],
      }),
    );
    renderPage();

    fireEvent.click(await screen.findByText('workout.resumeAction'));

    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('8.5')).toBeInTheDocument();
    // The clock continues from the draft rather than restarting at zero.
    expect(screen.getByText(/workout\.elapsed.*"minutes":12/)).toBeInTheDocument();
  });

  it('starts clean and forgets the draft when the offer is declined', async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        startedAt: Date.now() - 60_000,
        notes: '',
        exercises: [
          {
            name: 'Bench Press',
            sets: [{ targetReps: 8, targetWeight: 60, reps: '8', weight: '60', rpe: '', done: true }],
          },
        ],
      }),
    );
    renderPage();

    fireEvent.click(await screen.findByText('workout.resumeDiscard'));

    expect(screen.queryByText('workout.resumeTitle')).not.toBeInTheDocument();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(screen.getByText(/0\/2/)).toBeInTheDocument();
  });

  it('sends the logged sets with their RPE and clears the draft', async () => {
    vi.mocked(workoutSessionService.create).mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof workoutSessionService.create>>,
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderPage();
    await screen.findByText('Bench Press');

    // Mark set 1 done, then give it an RPE.
    fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
    await user.selectOptions(
      screen.getByLabelText(/workout.rpeFor.*"number":1/),
      '8.5',
    );
    fireEvent.click(screen.getByText('workout.finish'));

    await waitFor(() => {
      expect(workoutSessionService.create).toHaveBeenCalled();
    });

    const [payload] = vi.mocked(workoutSessionService.create).mock.calls[0];
    expect(payload.exercises).toHaveLength(1);
    expect(payload.exercises[0].sets).toEqual([
      expect.objectContaining({ reps: 8, weight: 60, rpe: 8.5 }),
    ]);
    // Only after the server confirms — otherwise the crash net is dropped
    // exactly when the request is most likely to have failed.
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('omits RPE entirely when it was not reported', async () => {
    vi.mocked(workoutSessionService.create).mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof workoutSessionService.create>>,
    );
    renderPage();
    await screen.findByText('Bench Press');

    fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
    fireEvent.click(screen.getByText('workout.finish'));

    await waitFor(() => {
      expect(workoutSessionService.create).toHaveBeenCalled();
    });

    const [payload] = vi.mocked(workoutSessionService.create).mock.calls[0];
    expect(payload.exercises[0].sets[0]).not.toHaveProperty('rpe');
  });

  it('refuses to file a session with nothing logged', async () => {
    renderPage();
    await screen.findByText('Bench Press');

    fireEvent.click(screen.getByText('workout.finish'));

    expect(workoutSessionService.create).not.toHaveBeenCalled();
  });

  /**
   * Found by this file: the loader depended on `t`, which changes identity
   * when the language changes — so switching language mid-workout rebuilt the
   * draft from the plan and discarded every set already logged.
   */
  it('keeps logged sets when the translation function changes identity', async () => {
    renderPage();
    await screen.findByText('Bench Press');

    fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();

    // Any re-render hands the component a fresh `t` (see the mock above).
    fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":2/));

    expect(screen.getByText(/2\/2/)).toBeInTheDocument();
  });

  it('shows an error rather than an empty screen when the plan is gone', async () => {
    vi.mocked(trainingPlanService.getById).mockRejectedValue(new Error('404'));

    renderPage();

    expect(await screen.findByText('workout.dayNotFound')).toBeInTheDocument();
  });
});

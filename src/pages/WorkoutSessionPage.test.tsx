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
  workoutSessionService: { create: vi.fn(), getByUserId: vi.fn() },
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

/**
 * Weekdays are assigned relative to the day the suite happens to run on, so
 * that "which option is marked today" is a fixed answer rather than one that
 * changes seven times a week. `Lower` is today; the other two are not.
 */
const TODAY_DOW = new Date().getDay();

const PLAN = {
  _id: 'plan-1',
  title: 'Upper / Lower Split',
  days: [
    {
      dayName: 'Upper A',
      dayOfWeek: (TODAY_DOW + 1) % 7,
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
    {
      dayName: 'Lower',
      dayOfWeek: TODAY_DOW,
      exercises: [
        {
          name: 'Back Squat',
          muscleGroup: 'legs',
          sets: [{ targetReps: 5, targetWeight: 100 }],
        },
      ],
    },
    {
      dayName: 'Upper B',
      dayOfWeek: (TODAY_DOW + 2) % 7,
      exercises: [
        {
          name: 'Pull Up',
          muscleGroup: 'back',
          sets: [{ targetReps: 6, targetWeight: 0 }],
        },
      ],
    },
  ],
};

/** The same plan with nothing to choose between. */
const ONE_DAY_PLAN = { ...PLAN, days: [PLAN.days[0]] };

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
    // No history by default: every test that predates the prefill expects the
    // sheet to open empty.
    vi.mocked(workoutSessionService.getByUserId).mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the plan day and its sets', async () => {
    renderPage();

    // By role: the day picker carries the same name in an <option>.
    expect(
      await screen.findByRole('heading', { name: 'Upper A' }),
    ).toBeInTheDocument();
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

  /**
   * Carrying reps and weight down the exercise.
   *
   * The inputs have no accessible name of their own — the caption sits in the
   * wrapping label and reads the same on every row — so they are picked out
   * by their placeholder, which is the set's own target. Bench Press targets
   * 8 reps on both sets and 60kg then 62.5kg, which makes the reps inputs an
   * ordered pair and each weight input unique.
   */
  describe('carrying numbers down the sets', () => {
    const repsInputs = () =>
      screen.getAllByPlaceholderText('8') as HTMLInputElement[];

    it('copies reps and weight into the sets below', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.change(repsInputs()[0], { target: { value: '10' } });
      fireEvent.change(screen.getByPlaceholderText('60'), {
        target: { value: '65' },
      });

      expect(repsInputs()[1].value).toBe('10');
      expect((screen.getByPlaceholderText('62.5') as HTMLInputElement).value).toBe(
        '65',
      );
    });

    it('follows a correction to the set above', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      // Typing "1" on the way to "12" must not strand the set below on "1".
      fireEvent.change(repsInputs()[0], { target: { value: '1' } });
      fireEvent.change(repsInputs()[0], { target: { value: '12' } });

      expect(repsInputs()[1].value).toBe('12');
    });

    it('stops at a set the user typed into themselves', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.click(screen.getAllByText('workout.addSet')[0]);
      // Set 2 is the user's own, and set 3 follows it rather than set 1.
      fireEvent.change(repsInputs()[1], { target: { value: '6' } });
      fireEvent.change(repsInputs()[0], { target: { value: '12' } });

      expect(repsInputs()[1].value).toBe('6');
      expect(repsInputs()[2].value).toBe('6');
      expect(repsInputs()[0].value).toBe('12');
    });

    it('leaves a set that is already done alone', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      // Marking done fills set 2 from its target: 8 reps.
      fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":2/));
      fireEvent.change(repsInputs()[0], { target: { value: '12' } });

      expect(repsInputs()[1].value).toBe('8');
    });

    it('does not carry over sets restored from a draft', async () => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          startedAt: Date.now() - 5 * 60_000,
          notes: '',
          exercises: [
            {
              name: 'Bench Press',
              muscleGroup: 'chest',
              sets: [
                { targetReps: 8, targetWeight: 60, reps: '', weight: '', rpe: '', done: false },
                { targetReps: 8, targetWeight: 62.5, reps: '5', weight: '70', rpe: '', done: false },
              ],
            },
          ],
        }),
      );
      renderPage();

      fireEvent.click(await screen.findByText('workout.resumeAction'));
      fireEvent.change(repsInputs()[0], { target: { value: '12' } });

      // Written before the flags existed, so the numbers themselves are the
      // evidence that a person put them there.
      expect(repsInputs()[1].value).toBe('5');
    });

    it('starts an added set on the numbers of the one above it', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.change(repsInputs()[0], { target: { value: '10' } });
      fireEvent.click(screen.getAllByText('workout.addSet')[0]);

      expect(repsInputs()[2].value).toBe('10');
    });
  });

  /**
   * Opening the day on what happened last time.
   *
   * The plan prescribes 2 sets of Bench Press at 8 x 60 and 8 x 62.5; the
   * sessions below are what the user is supposed to have actually done.
   */
  describe('the last session of this day', () => {
    const repsInputs = () =>
      screen.getAllByPlaceholderText('8') as HTMLInputElement[];
    const lastSession = (
      sets: { reps: number; weight: number }[],
      name = 'Bench Press',
    ) =>
      vi.mocked(workoutSessionService.getByUserId).mockResolvedValue([
        {
          _id: 's-1',
          performedAt: '2026-09-12T18:00:00.000Z',
          dayName: 'Upper A',
          exercises: [{ name, sets }],
        },
      ] as unknown as Awaited<
        ReturnType<typeof workoutSessionService.getByUserId>
      >);

    it('asks for one session of exactly this plan day', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      await waitFor(() => {
        expect(workoutSessionService.getByUserId).toHaveBeenCalledWith(
          'user-1',
          { planId: 'plan-1', dayName: 'Upper A', limit: 1 },
        );
      });
    });

    it('fills the sets in, without marking any of them done', async () => {
      lastSession([
        { reps: 9, weight: 65 },
        { reps: 7, weight: 65 },
      ]);
      renderPage();
      await screen.findByText('Bench Press');

      await waitFor(() => expect(repsInputs()[0].value).toBe('9'));
      expect(repsInputs()[1].value).toBe('7');
      expect(
        (screen.getByPlaceholderText('60') as HTMLInputElement).value,
      ).toBe('65');
      // Performed last week is not performed today.
      expect(screen.getByText(/0\/2/)).toBeInTheDocument();
    });

    it('says where the numbers came from', async () => {
      lastSession([{ reps: 9, weight: 65 }]);
      renderPage();

      expect(
        await screen.findByText(/workout.filledFromLast/),
      ).toBeInTheDocument();
    });

    it('leaves an exercise the last session did not contain', async () => {
      // A swap: last time this slot was an incline press.
      lastSession([{ reps: 9, weight: 65 }], 'Incline Press');
      renderPage();
      await screen.findByText('Bench Press');

      await waitFor(() =>
        expect(workoutSessionService.getByUserId).toHaveBeenCalled(),
      );
      expect(repsInputs()[0].value).toBe('');
    });

    it('brings back a set performed beyond what the plan prescribes', async () => {
      lastSession([
        { reps: 9, weight: 65 },
        { reps: 8, weight: 65 },
        { reps: 6, weight: 65 },
      ]);
      renderPage();
      await screen.findByText('Bench Press');

      // Three rows for a two-set day, and the counter agrees.
      await waitFor(() => expect(repsInputs()).toHaveLength(3));
      expect(repsInputs()[2].value).toBe('6');
      expect(screen.getByText(/0\/3/)).toBeInTheDocument();
    });

    it('does not persist a sheet the user has not touched', async () => {
      lastSession([
        { reps: 9, weight: 65 },
        { reps: 7, weight: 65 },
      ]);
      renderPage();
      await screen.findByText('Bench Press');
      await waitFor(() => expect(repsInputs()[0].value).toBe('9'));

      // The crash net writes 400ms after a change. Numbers that arrived on
      // their own are not a workout in progress, and saving them would offer
      // to "resume" a session nobody started.
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it('logs only the sets that were marked done', async () => {
      vi.mocked(workoutSessionService.create).mockResolvedValue(
        {} as unknown as Awaited<
          ReturnType<typeof workoutSessionService.create>
        >,
      );
      lastSession([
        { reps: 9, weight: 65 },
        { reps: 7, weight: 65 },
      ]);
      renderPage();
      await screen.findByText('Bench Press');
      await waitFor(() => expect(repsInputs()[0].value).toBe('9'));

      fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
      fireEvent.click(screen.getByText('workout.finish'));

      await waitFor(() => {
        expect(workoutSessionService.create).toHaveBeenCalled();
      });
      const [payload] = vi.mocked(workoutSessionService.create).mock.calls[0];
      expect(payload.exercises[0].sets).toEqual([
        expect.objectContaining({ reps: 9, weight: 65 }),
      ]);
    });

    it('yields to a draft the user resumed', async () => {
      lastSession([
        { reps: 9, weight: 65 },
        { reps: 7, weight: 65 },
      ]);
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          startedAt: Date.now() - 4 * 60_000,
          notes: '',
          exercises: [
            {
              name: 'Bench Press',
              sets: [
                { targetReps: 8, targetWeight: 60, reps: '5', weight: '80', repsTyped: true, weightTyped: true, rpe: '', done: true },
                { targetReps: 8, targetWeight: 62.5, reps: '', weight: '', rpe: '', done: false },
              ],
            },
          ],
        }),
      );
      renderPage();

      fireEvent.click(await screen.findByText('workout.resumeAction'));
      await waitFor(() =>
        expect(workoutSessionService.getByUserId).toHaveBeenCalled(),
      );

      // The workout in progress stands, and the provenance line with it.
      expect(repsInputs()[0].value).toBe('5');
      expect(
        screen.queryByText(/workout.filledFromLast/),
      ).not.toBeInTheDocument();
    });

    /**
     * Where the prefill meets the carry-down. A set follows the one above it
     * only while it is showing what that set was showing.
     */
    it('carries an edit across sets that repeat the same number', async () => {
      lastSession([
        { reps: 8, weight: 60 },
        { reps: 8, weight: 60 },
      ]);
      renderPage();
      await screen.findByText('Bench Press');
      await waitFor(() => expect(repsInputs()[1].value).toBe('8'));

      fireEvent.change(repsInputs()[0], { target: { value: '10' } });

      expect(repsInputs()[1].value).toBe('10');
    });

    it('keeps a ramp the last session actually performed', async () => {
      lastSession([
        { reps: 8, weight: 60 },
        { reps: 6, weight: 70 },
      ]);
      renderPage();
      await screen.findByText('Bench Press');
      await waitFor(() => expect(repsInputs()[1].value).toBe('6'));

      fireEvent.change(repsInputs()[0], { target: { value: '10' } });
      fireEvent.change(screen.getByPlaceholderText('60'), {
        target: { value: '65' },
      });

      // Set 2 was heavier for fewer reps last week — its own numbers, not a
      // copy of set 1's, so nothing above it may overwrite them.
      expect(repsInputs()[1].value).toBe('6');
      expect(
        (screen.getByPlaceholderText('62.5') as HTMLInputElement).value,
      ).toBe('70');
    });
  });

  /**
   * Drop sets. The set stays one set — the whole reason the reductions are
   * nested rather than appended as siblings.
   */
  describe('drop sets', () => {
    it('offers no drop rows until one is asked for', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      expect(screen.queryByLabelText(/workout.dropRepsFor/)).not.toBeInTheDocument();
      expect(screen.getAllByText('workout.addDrop').length).toBeGreaterThan(0);
    });

    it('seeds a new drop from the weight above it', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.click(screen.getAllByText('workout.addDrop')[0]);

      const weight = screen.getByLabelText(
        /workout.dropWeightFor.*"set":1,"drop":1/,
      ) as HTMLInputElement;
      // The plan's target for set 1 — a starting point, not a claim.
      expect(weight.value).toBe('60');

      // Reps are deliberately blank: only the user knows how many they got.
      const reps = screen.getByLabelText(
        /workout.dropRepsFor.*"set":1,"drop":1/,
      ) as HTMLInputElement;
      expect(reps.value).toBe('');
    });

    it('sends the drops nested inside their set', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.click(screen.getAllByText('workout.addDrop')[0]);
      fireEvent.change(
        screen.getByLabelText(/workout.dropRepsFor.*"set":1,"drop":1/),
        { target: { value: '6' } },
      );
      fireEvent.change(
        screen.getByLabelText(/workout.dropWeightFor.*"set":1,"drop":1/),
        { target: { value: '40' } },
      );

      fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
      fireEvent.click(screen.getByText('workout.finish'));

      await waitFor(() => {
        expect(workoutSessionService.create).toHaveBeenCalled();
      });

      const [payload] = vi.mocked(workoutSessionService.create).mock.calls[0];
      // One set, with the reduction inside it — not two sets.
      expect(payload.exercises[0].sets).toHaveLength(1);
      expect(payload.exercises[0].sets[0]).toEqual(
        expect.objectContaining({
          reps: 8,
          weight: 60,
          drops: [{ reps: 6, weight: 40 }],
        }),
      );
    });

    /**
     * A drop started and never performed is not zero work — it is no work, and
     * sending it as 0 reps would quietly dilute the volume figure.
     */
    it('drops an unfilled reduction rather than sending zero reps', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.click(screen.getAllByText('workout.addDrop')[0]);
      fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
      fireEvent.click(screen.getByText('workout.finish'));

      await waitFor(() => {
        expect(workoutSessionService.create).toHaveBeenCalled();
      });

      const [payload] = vi.mocked(workoutSessionService.create).mock.calls[0];
      expect(payload.exercises[0].sets[0]).not.toHaveProperty('drops');
    });

    it('removes a drop again, and the set stops being a drop set', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.click(screen.getAllByText('workout.addDrop')[0]);
      expect(screen.getByLabelText(/workout.dropRepsFor/)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/workout.removeDrop.*"drop":1/));
      expect(screen.queryByLabelText(/workout.dropRepsFor/)).not.toBeInTheDocument();
    });
  });

  /**
   * The plan's weekday is a schedule, not a rule. The gym is busy, Tuesday's
   * session gets done on Wednesday, and before this the logger could only ever
   * record the day the dashboard sent it to.
   */
  describe('choosing which day is being logged', () => {
    const picker = () =>
      screen.getByRole('combobox', { name: 'workout.planDay' });

    it('lists every day of the plan, marking the one that is today', async () => {
      renderPage();
      await screen.findByText('Bench Press');

      const options = [...picker().querySelectorAll('option')].map(
        (option) => option.textContent,
      );

      // Only `Lower` falls on today's weekday, so only it carries the marker.
      expect(options).toEqual([
        'Upper A',
        'workout.planDayToday:{"day":"Lower"}',
        'Upper B',
      ]);
    });

    it('replaces the sheet with the chosen day', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      renderPage();
      await screen.findByText('Bench Press');

      await user.selectOptions(picker(), '2');

      expect(await screen.findByText('Pull Up')).toBeInTheDocument();
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
      // The heading follows the choice, and so does what a save would record.
      expect(screen.getByRole('heading', { name: 'Upper B' })).toBeInTheDocument();
    });

    /**
     * Each day keeps its own draft, so switching is not a way to lose work.
     * Guards the crash net's storage key against being paired with another
     * day's sets — the failure would be silent, and would surface as one
     * workout logged under the wrong day.
     */
    it('keeps each day’s logged sets under its own key', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      renderPage();
      await screen.findByText('Bench Press');

      fireEvent.click(screen.getByLabelText(/workout.markSetDone.*"number":1/));
      expect(screen.getByText(/1\/2/)).toBeInTheDocument();

      await user.selectOptions(picker(), '1');
      await screen.findByText('Back Squat');

      // A fresh sheet, not the previous day's set carried across.
      expect(screen.getByText(/0\/1/)).toBeInTheDocument();

      await waitFor(() => {
        expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
      });
      expect(localStorage.getItem('fitai-workout-draft:plan-1:1')).toBeNull();
    });

    /**
     * The stored offer belonged to the day that was open when it was read.
     * Carrying it across would paste one day's exercises onto another's sheet.
     */
    it('withdraws a resume offer that belonged to the day left behind', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          startedAt: Date.now() - 5 * 60_000,
          notes: '',
          exercises: [
            {
              name: 'Bench Press',
              muscleGroup: 'chest',
              sets: [
                { targetReps: 8, targetWeight: 60, reps: '8', weight: '60', rpe: '', done: true },
              ],
            },
          ],
        }),
      );
      renderPage();

      expect(await screen.findByText('workout.resumeTitle')).toBeInTheDocument();

      await user.selectOptions(picker(), '1');
      await screen.findByText('Back Squat');

      expect(screen.queryByText('workout.resumeTitle')).not.toBeInTheDocument();
    });

    it('is not offered when the plan has a single day to log', async () => {
      vi.mocked(trainingPlanService.getById).mockResolvedValue(
        ONE_DAY_PLAN as unknown as Awaited<
          ReturnType<typeof trainingPlanService.getById>
        >,
      );
      renderPage();
      await screen.findByText('Bench Press');

      expect(
        screen.queryByRole('combobox', { name: 'workout.planDay' }),
      ).not.toBeInTheDocument();
    });
  });

  it('shows an error rather than an empty screen when the plan is gone', async () => {
    vi.mocked(trainingPlanService.getById).mockRejectedValue(new Error('404'));

    renderPage();

    expect(await screen.findByText('workout.dayNotFound')).toBeInTheDocument();
  });
});

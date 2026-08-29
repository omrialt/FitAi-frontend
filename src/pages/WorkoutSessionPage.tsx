import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Center, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AppLayout } from '../components/AppLayout';
import { StitchIcon } from '../components/common/StitchIcon';
import { PlateCalculator } from '../components/workout/PlateCalculator';
import { RestTimer } from '../components/workout/RestTimer';
import {
  BAR_OPTIONS_KG,
  DEFAULT_BAR_KG,
} from '../components/workout/plateMath';
import { useWorkoutDraft } from '../hooks/useWorkoutDraft';
import { progressStatsService } from '../services/progress-stats.service';
import { trainingPlanService } from '../services/training-plan.service';
import { workoutSessionService } from '../services/workout-session.service';
import { useAuthStore } from '../store/authStore';
import type { TrainingPlan } from '../types/training-plan.types';
import type { SessionExercise } from '../types/workout-session.types';

/**
 * Live workout logger.
 *
 * The gap analysis called this the largest UX hole in the product, and it was:
 * a plan could prescribe sets but there was nowhere to record performing them
 * except by editing the plan itself. This writes a `WorkoutSession` instead, so
 * the record survives the plan being edited, shared or deleted.
 *
 * Two decisions worth stating:
 *   - the plan's targets are placeholders, never prefilled values. A prefilled
 *     input invites tapping "done" through a workout you did not do, and the
 *     whole point of the log is that it records reality;
 *   - a set counts only when explicitly marked done. Half-finishing a workout
 *     and saving is normal, and the log should show what happened.
 */

interface SetDraft {
  targetReps: number;
  targetWeight: number;
  reps: string;
  weight: string;
  /** Kept as a string like the other inputs; '' means "not reported". */
  rpe: string;
  done: boolean;
}

interface ExerciseDraft {
  name: string;
  muscleGroup?: string;
  notes?: string;
  sets: SetDraft[];
}

/** The bar is a property of the gym, not of the workout, so it outlives the session. */
const BAR_STORAGE_KEY = 'fitai-bar-weight';

function readStoredBar(): number {
  try {
    const stored = Number(localStorage.getItem(BAR_STORAGE_KEY));
    return BAR_OPTIONS_KG.includes(stored) ? stored : DEFAULT_BAR_KG;
  } catch {
    return DEFAULT_BAR_KG;
  }
}

function minutesSince(start: number): number {
  return Math.max(1, Math.round((Date.now() - start) / 60000));
}

export default function WorkoutSessionPage() {
  const { planId, dayIndex } = useParams<{ planId: string; dayIndex: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [draft, setDraft] = useState<ExerciseDraft[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [barKg, setBarKg] = useState(readStoredBar);

  const startedAt = useRef(Date.now());
  const dayIdx = Number(dayIndex);

  const {
    pending,
    save: saveDraft,
    clear: clearDraft,
    dismiss: dismissDraft,
  } = useWorkoutDraft<ExerciseDraft>(planId, dayIndex);

  const day = useMemo(
    () => (plan && Number.isInteger(dayIdx) ? plan.days[dayIdx] : undefined),
    [plan, dayIdx],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!planId) return;
      try {
        const loaded = await trainingPlanService.getById(planId);
        if (cancelled) return;

        setPlan(loaded);
        const target = loaded.days[Number(dayIndex)];
        setDraft(
          (target?.exercises ?? []).map((exercise) => ({
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            notes: exercise.notes,
            sets: exercise.sets.map((set) => ({
              targetReps: set.targetReps,
              targetWeight: set.targetWeight,
              reps: '',
              weight: '',
              rpe: '',
              done: false,
            })),
          })),
        );
      } catch {
        if (!cancelled) toast.error(t('workout.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planId, dayIndex, t]);

  // Session clock. Ticks every 15s — a workout is measured in minutes, and a
  // per-second re-render of the whole list buys nothing.
  useEffect(() => {
    const id = window.setInterval(
      () => setElapsed(minutesSince(startedAt.current)),
      15000,
    );
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(BAR_STORAGE_KEY, String(barKg));
    } catch {
      // A remembered bar is a convenience, not a requirement.
    }
  }, [barKg]);

  /**
   * Crash net. Only a session with something in it is worth persisting —
   * writing on load would offer to "resume" a workout nobody started.
   */
  useEffect(() => {
    if (loading) return;

    const touched = draft.some((exercise) =>
      exercise.sets.some((set) => set.done || set.reps || set.weight || set.rpe),
    );
    if (!touched && !notes.trim()) return;

    saveDraft({ startedAt: startedAt.current, notes, exercises: draft });
  }, [draft, notes, loading, saveDraft]);

  /** Adopts the stored draft, clock included, and drops the offer. */
  const resume = useCallback(() => {
    if (!pending) return;

    setDraft(pending.exercises);
    setNotes(pending.notes);
    startedAt.current = pending.startedAt;
    setElapsed(minutesSince(pending.startedAt));
    dismissDraft();
  }, [pending, dismissDraft]);

  /** Keeps the fresh screen and throws the stored draft away for good. */
  const discardDraft = useCallback(() => {
    clearDraft();
    startedAt.current = Date.now();
    setElapsed(0);
  }, [clearDraft]);

  const patchSet = useCallback(
    (ei: number, si: number, patch: Partial<SetDraft>) => {
      setDraft((current) =>
        current.map((exercise, i) =>
          i !== ei
            ? exercise
            : {
                ...exercise,
                sets: exercise.sets.map((set, j) =>
                  j !== si ? set : { ...set, ...patch },
                ),
              },
        ),
      );
    },
    [],
  );

  /** Marking a set done fills anything left blank from the plan's target. */
  const toggleDone = useCallback(
    (ei: number, si: number) => {
      setDraft((current) =>
        current.map((exercise, i) =>
          i !== ei
            ? exercise
            : {
                ...exercise,
                sets: exercise.sets.map((set, j) => {
                  if (j !== si) return set;
                  const done = !set.done;
                  if (!done) return { ...set, done };
                  return {
                    ...set,
                    done,
                    reps: set.reps || String(set.targetReps),
                    weight: set.weight || String(set.targetWeight),
                  };
                }),
              },
        ),
      );
    },
    [],
  );

  const addSet = useCallback((ei: number) => {
    setDraft((current) =>
      current.map((exercise, i) => {
        if (i !== ei) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          // An extra set inherits the last one's targets — the common case is
          // "one more like that".
          sets: [
            ...exercise.sets,
            {
              targetReps: last?.targetReps ?? 0,
              targetWeight: last?.targetWeight ?? 0,
              reps: '',
              weight: '',
              rpe: '',
              done: false,
            },
          ],
        };
      }),
    );
  }, []);

  const completedSets = useMemo(
    () => draft.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0),
    [draft],
  );
  const totalSets = useMemo(
    () => draft.reduce((n, e) => n + e.sets.length, 0),
    [draft],
  );

  const finish = useCallback(async () => {
    if (completedSets === 0) {
      toast.error(t('workout.nothingLogged'));
      return;
    }

    const exercises: SessionExercise[] = draft
      .map((exercise) => ({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        notes: exercise.notes,
        sets: exercise.sets
          .filter((set) => set.done)
          .map((set) => ({
            reps: Number(set.reps) || 0,
            weight: Number(set.weight) || 0,
            // Omitted rather than sent as 0: the server validates 1–10, and
            // "not reported" is a real answer that must not become a value.
            ...(set.rpe ? { rpe: Number(set.rpe) } : {}),
          })),
      }))
      .filter((exercise) => exercise.sets.length > 0);

    setSaving(true);
    try {
      await workoutSessionService.create({
        planId: plan?._id,
        planTitle: plan?.title,
        dayName: day?.dayName,
        durationMinutes: minutesSince(startedAt.current),
        notes: notes.trim() || undefined,
        exercises,
      });

      // ProgressStats is a stored snapshot, not a live view, so the dashboard's
      // workout counters would keep showing yesterday's number until something
      // else happened to regenerate them. Best-effort: the session is already
      // saved, and a stale counter is not worth failing the whole flow over.
      if (user?._id) {
        try {
          await progressStatsService.recalculate(user._id);
        } catch {
          // Counters will catch up on the next recalculation.
        }
      }

      // Only once the server has the session: clearing earlier would drop the
      // crash net exactly when the request is most likely to fail.
      clearDraft();

      toast.success(t('workout.saved'));
      navigate('/');
    } catch {
      toast.error(t('workout.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [
    completedSets,
    draft,
    plan,
    day,
    notes,
    navigate,
    t,
    user?._id,
    clearDraft,
  ]);

  if (loading) {
    return (
      <AppLayout>
        <Container size="md" py="xl">
          <Center h={320}>
            <Loader size="lg" />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  if (!plan || !day) {
    return (
      <AppLayout>
        <Container size="md" py="xl">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('common.error')}
            color="red"
            variant="light"
          >
            {t('workout.dayNotFound')}
          </Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Bottom padding clears the fixed rest timer sitting above the app footer */}
      <Container size="md" py="md" pb={120}>
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {plan.title}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              {day.dayName}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-on-surface-variant">
              <StitchIcon name="timer" size={15} />
              {t('workout.elapsed', { minutes: elapsed })}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {completedSets}/{totalSets}
              </span>
              {t('workout.setsDone')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {t('workout.barWeight')}
              <select
                value={barKg}
                onChange={(e) => setBarKg(Number(e.target.value))}
                className="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm tabular-nums text-on-surface outline-none focus:border-primary"
              >
                {BAR_OPTIONS_KG.map((option) => (
                  <option key={option} value={option}>
                    {option === 0 ? t('workout.noBar') : `${option} ${t('workout.weight')}`}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="rounded-lg bg-primary-gradient px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving ? t('workout.saving') : t('workout.finish')}
            </button>
          </div>
        </header>

        {/* Offered, never applied: silently repopulating the screen would be
            indistinguishable from a bug the first time it happened. */}
        {pending && (
          <div
            role="status"
            className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4"
          >
            <StitchIcon name="history" size={20} />
            <p className="flex-1 text-sm text-on-surface">
              <span className="font-bold">{t('workout.resumeTitle')}</span>{' '}
              <span className="text-on-surface-variant">
                {t('workout.resumeDetail', {
                  minutes: minutesSince(pending.startedAt),
                })}
              </span>
            </p>
            <button
              type="button"
              onClick={resume}
              className="min-h-10 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
            >
              {t('workout.resumeAction')}
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="min-h-10 rounded-lg px-3 text-sm font-bold text-on-surface-variant hover:text-on-surface"
            >
              {t('workout.resumeDiscard')}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {draft.map((exercise, ei) => (
            <section
              key={`${exercise.name}-${ei}`}
              className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-5"
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-extrabold text-on-surface">
                  {exercise.name}
                </h2>
                {exercise.muscleGroup && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {exercise.muscleGroup}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {exercise.sets.map((set, si) => (
                  <div
                    key={si}
                    className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 transition-colors ${
                      set.done
                        ? 'border-success/40 bg-success/5'
                        : 'border-transparent bg-surface-container-low'
                    }`}
                  >
                    <span className="w-7 shrink-0 text-center text-xs font-black tabular-nums text-on-surface-variant">
                      {si + 1}
                    </span>

                    <label className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('workout.reps')}
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={set.reps}
                        placeholder={String(set.targetReps)}
                        onChange={(e) =>
                          patchSet(ei, si, { reps: e.target.value })
                        }
                        className="h-12 w-16 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-center text-base tabular-nums text-on-surface outline-none focus:border-primary"
                      />
                    </label>

                    <label className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('workout.weight')}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.5"
                        value={set.weight}
                        placeholder={String(set.targetWeight)}
                        onChange={(e) =>
                          patchSet(ei, si, { weight: e.target.value })
                        }
                        className="h-12 w-20 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-center text-base tabular-nums text-on-surface outline-none focus:border-primary"
                      />
                    </label>

                    {/* Optional on purpose. RPE is the input every future
                        fatigue or deload signal reads, but a required field
                        would turn a two-tap set into a three-tap one. */}
                    <label className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('workout.rpe')}
                      </span>
                      <select
                        value={set.rpe}
                        aria-label={t('workout.rpeFor', { number: si + 1 })}
                        onChange={(e) =>
                          patchSet(ei, si, { rpe: e.target.value })
                        }
                        className="h-12 w-16 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-1 text-center text-base tabular-nums text-on-surface outline-none focus:border-primary"
                      >
                        <option value="">–</option>
                        {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleDone(ei, si)}
                      aria-pressed={set.done}
                      aria-label={t('workout.markSetDone', { number: si + 1 })}
                      className={`ms-auto flex h-12 w-14 items-center justify-center rounded-lg transition-[background-color] duration-[180ms] ${set.done ? 'animate-set-pop ' : ''}${
                        set.done
                          ? 'bg-success text-on-success shadow-[0_0_8px_0_var(--color-success)]'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary'
                      }`}
                    >
                      <StitchIcon name="check" size={22} />
                    </button>

                    {/* Reads what was typed, falling back to the plan's
                        target — the question at the rack is about the bar you
                        are walking up to, not the one you already lifted. */}
                    <PlateCalculator
                      weightKg={Number(set.weight) || set.targetWeight}
                      barKg={barKg}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSet(ei)}
                className="mt-3 inline-flex min-h-12 items-center gap-1.5 rounded-lg border border-outline-variant/40 px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              >
                <StitchIcon name="add" size={16} />
                {t('workout.addSet')}
              </button>
            </section>
          ))}
        </div>

        <label className="mt-6 flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('workout.sessionNotes')}
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={t('workout.sessionNotesPlaceholder')}
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none focus:border-primary"
          />
        </label>
      </Container>

      <RestTimer />
    </AppLayout>
  );
}

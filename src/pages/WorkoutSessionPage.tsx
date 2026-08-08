import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Center, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AppLayout } from '../components/AppLayout';
import { StitchIcon } from '../components/common/StitchIcon';
import { RestTimer } from '../components/workout/RestTimer';
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
  done: boolean;
}

interface ExerciseDraft {
  name: string;
  muscleGroup?: string;
  notes?: string;
  sets: SetDraft[];
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

  const startedAt = useRef(Date.now());
  const dayIdx = Number(dayIndex);

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

      toast.success(t('workout.saved'));
      navigate('/');
    } catch {
      toast.error(t('workout.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [completedSets, draft, plan, day, notes, navigate, t, user?._id]);

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

          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="rounded-lg bg-primary-gradient px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? t('workout.saving') : t('workout.finish')}
          </button>
        </header>

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
                        ? 'border-green-500/40 bg-green-500/5'
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
                        className="w-16 rounded-md border border-outline-variant/30 bg-surface-container-lowest px-2 py-1.5 text-center tabular-nums text-on-surface outline-none focus:border-primary"
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
                        className="w-20 rounded-md border border-outline-variant/30 bg-surface-container-lowest px-2 py-1.5 text-center tabular-nums text-on-surface outline-none focus:border-primary"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleDone(ei, si)}
                      aria-pressed={set.done}
                      aria-label={t('workout.markSetDone', { number: si + 1 })}
                      className={`ms-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                        set.done
                          ? 'bg-green-500 text-white'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white'
                      }`}
                    >
                      <StitchIcon name="check" size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSet(ei)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <StitchIcon name="add" size={14} />
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

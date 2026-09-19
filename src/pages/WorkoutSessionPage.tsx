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
import { SwapExercise } from '../components/workout/SwapExercise';
import {
  BAR_OPTIONS_KG,
  readStoredBar,
  storeBar,
} from '../components/workout/plateMath';
import { useWorkoutDraft } from '../hooks/useWorkoutDraft';
import { enqueue, mintClientId } from '../services/offline-queue';
import { progressStatsService } from '../services/progress-stats.service';
import { trainingPlanService } from '../services/training-plan.service';
import { workoutSessionService } from '../services/workout-session.service';
import { useAuthStore } from '../store/authStore';
import { todaysPlanDayIndex } from '../utils/planDay';
import type { TrainingDay, TrainingPlan } from '../types/training-plan.types';
import type {
  SessionExercise,
  WorkoutSession,
} from '../types/workout-session.types';

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

/** One reduction inside a drop set, as typed. */
interface DropDraft {
  reps: string;
  weight: string;
}

interface SetDraft {
  targetReps: number;
  targetWeight: number;
  reps: string;
  weight: string;
  /**
   * Whether the number above is the user's own, typed into *this* row.
   *
   * A set carries its reps and weight down to the sets below it, so a value
   * on screen is either something the user entered or something copied from
   * the set above. These two say which, and nothing else can tell them apart:
   * a copied "10" and a typed "10" are the same string. Only a copied value
   * may be overwritten by a later edit further up.
   *
   * Optional because a draft stored before the carry-down existed has neither,
   * which is a third state — "unknown" — and not the same as `false`.
   */
  repsTyped?: boolean;
  weightTyped?: boolean;
  /** Kept as a string like the other inputs; '' means "not reported". */
  rpe: string;
  /**
   * Reductions taken without rest, below the top portion above.
   *
   * Absent on an ordinary set rather than an empty array: the row only grows a
   * drop section once the user asks for one, so a normal set stays a normal
   * set and the screen does not get busier for the 90% case.
   */
  drops?: DropDraft[];
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

/**
 * A day of the plan as an unfilled sheet.
 *
 * The targets come across as placeholders and nothing is filled in. What the
 * user performed last time is filled in — by `withLastPerformance` below,
 * once it has been fetched — but the plan's own numbers are never a value.
 * The distinction is the point: last Tuesday's 80kg is a fact about this
 * user, while the plan's 80kg is a wish someone typed into a form, and only
 * one of the two is worth a tap on "done".
 */
function blankDraft(day: TrainingDay): ExerciseDraft[] {
  return day.exercises.map((exercise) => ({
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    notes: exercise.notes,
    sets: exercise.sets.map((set) => ({
      targetReps: set.targetReps,
      targetWeight: set.targetWeight,
      reps: '',
      weight: '',
      repsTyped: false,
      weightTyped: false,
      rpe: '',
      done: false,
    })),
  }));
}

/**
 * Reads a stored draft as sets the user typed themselves.
 *
 * Whatever a resumed draft carries, they put there — an hour ago, in the gym.
 * Without this, the first edit made to a set above one of them would carry
 * down over work that was actually performed. Drafts written before the
 * carry-down existed have no flags at all, hence the `??`: a draft that does
 * carry them is believed, including where it says a value was only copied.
 */
function claimTypedSets(exercises: ExerciseDraft[]): ExerciseDraft[] {
  return exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      repsTyped: set.repsTyped ?? set.reps !== '',
      weightTyped: set.weightTyped ?? set.weight !== '',
    })),
  }));
}

/**
 * The last time this day was trained, laid over the blank sheet.
 *
 * Starting a session used to mean retyping the numbers from the session
 * before it — the same eight sets, usually the same weights, entered again
 * from memory or from the history screen in another tab. The log already
 * knows them.
 *
 * What comes across is reps and weight, and only that:
 *
 *   - nothing is marked done. The sheet says what you *did* last time, not
 *     what you have done today, and one is not evidence of the other;
 *   - nothing is typed, in the `repsTyped` sense, so a number carried in from
 *     last week still yields to one typed today and carries down the sets the
 *     same way a fresh entry does;
 *   - no RPE. It is a rating of how a particular set felt on a particular
 *     day, and copying one forward would be inventing it;
 *   - no drops. A reduction is a decision made at the rack, with the bar
 *     already loaded — pre-drawing the rows would be the screen deciding for
 *     the user that the set ends in a drop;
 *   - no notes. "Right shoulder twinged" belongs to the day it happened.
 *
 * Exercises are matched by name, so an exercise swapped out last session
 * leaves today's prescribed one blank rather than inheriting the substitute's
 * numbers. Sets are matched by position, and a session that ran past the
 * plan — an extra set or two, which the logger allows — brings those extra
 * sets with it rather than dropping them on the floor.
 */
function withLastPerformance(
  sheet: ExerciseDraft[],
  session: WorkoutSession,
): ExerciseDraft[] {
  const performed = new Map(session.exercises.map((e) => [e.name, e]));

  return sheet.map((exercise) => {
    const last = performed.get(exercise.name);
    if (!last || last.sets.length === 0) return exercise;

    const sets = exercise.sets.map((set, i) => {
      // Only the sets actually completed are filed, so a day that stopped
      // three sets in leaves the rest of the sheet on its placeholders.
      const done = last.sets[i];
      if (!done) return set;
      return { ...set, reps: String(done.reps), weight: String(done.weight) };
    });

    for (let i = exercise.sets.length; i < last.sets.length; i += 1) {
      const previous = sets[sets.length - 1];
      sets.push({
        // The plan has no target for a set it does not prescribe, so the row
        // inherits the last prescribed one's — the same thing "add a set"
        // does, and for the same reason.
        targetReps: previous?.targetReps ?? last.sets[i].reps,
        targetWeight: previous?.targetWeight ?? last.sets[i].weight,
        reps: String(last.sets[i].reps),
        weight: String(last.sets[i].weight),
        repsTyped: false,
        weightTyped: false,
        rpe: '',
        done: false,
      });
    }

    return { ...exercise, sets };
  });
}

/**
 * Whether this sheet holds anything the user did, as opposed to anything it
 * came up with on its own.
 *
 * Both callers turn on that distinction and neither can use "is there a
 * number in this box": the boxes fill themselves now, from last week's
 * session and from the set above. So the question is asked of the flags —
 * which record authorship — and of the marks only a tap can leave.
 *
 * The crash net reads it to decide whether there is a workout worth saving,
 * and would otherwise persist a sheet nobody has touched and offer to
 * "resume" it tomorrow. The prefill reads it to know whether it is still
 * allowed to write, and would otherwise be a late network response
 * overwriting sets the user had already logged.
 */
function hasUserInput(draft: ExerciseDraft[], notes: string): boolean {
  if (notes.trim()) return true;

  return draft.some((exercise) =>
    exercise.sets.some(
      (set) =>
        set.done ||
        set.rpe ||
        set.repsTyped ||
        set.weightTyped ||
        (set.drops?.length ?? 0) > 0,
    ),
  );
}

/**
 * How a set row is laid out, which is the whole of the mobile fix.
 *
 * It was one `flex-wrap` row of fixed-width controls. On a desktop they fit on
 * a line; on a 390px phone they did not, and flex-wrap breaks wherever it runs
 * out of room rather than where the meaning is. What that produced, measured
 * on a real phone width: three ragged lines per set, with the done button —
 * the one control the user actually reaches for between sets — stranded alone
 * on the second line, 116px from the inputs it belongs to. Eight sets of that
 * is the "crushed" screen.
 *
 * So below `sm` the row is a grid that says where things go instead of leaving
 * it to whatever fits:
 *
 *     [ # ] [ reps ] [ weight ] [ ✓ ]
 *           [ rpe  ] [ plate calculator ]
 *
 * Reps, weight and the done button — the logging action — stay together on the
 * first line; RPE (optional) and the plate breakdown (informational) drop to
 * the second. The two input columns are `1fr` rather than fixed, so the row
 * fits any phone instead of a particular one.
 *
 * From `sm` up it goes back to being the flex row it was, and every grid
 * placement class below is inert — `display: flex` ignores them, so the
 * desktop layout needs no resetting.
 */
const SET_ROW =
  'grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)_3.5rem] items-end gap-2 sm:flex sm:flex-wrap sm:items-center';

/** The same shape one column narrower: the drop rows have no RPE. */
const DROP_ROW =
  'grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-end gap-2 sm:flex sm:flex-wrap sm:items-center';

/**
 * Caption above the control on a phone, beside it from `sm` up.
 *
 * Inline is what made the fixed widths necessary: caption plus input is wider
 * than the third of a row a field can have, and something had to wrap.
 */
const FIELD = 'flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-1.5';

const FIELD_CAPTION =
  'text-[10px] font-bold uppercase tracking-wider text-on-surface-variant';

/**
 * Full width of its grid cell on a phone, back to a fixed width from `sm`.
 * `h-12` matches the done button, so the two line up when the grid aligns the
 * row to its baseline.
 */
const FIELD_CONTROL =
  'h-12 w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-center text-base tabular-nums text-on-surface outline-none focus:border-primary';

export default function WorkoutSessionPage() {
  const { planId, dayIndex } = useParams<{ planId: string; dayIndex: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [draft, setDraft] = useState<ExerciseDraft[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [barKg, setBarKg] = useState(readStoredBar);
  /**
   * The last session of the open day, tagged with the day it was fetched for.
   *
   * Tagged rather than bare because the day can change under it: the picker
   * switches day while a request for the previous one is still in flight, and
   * an answer about Upper A must never be laid over Lower.
   */
  const [lastSession, setLastSession] = useState<{
    dayName: string;
    session: WorkoutSession | null;
  } | null>(null);

  const startedAt = useRef(Date.now());
  const dayIdx = Number(dayIndex);

  const {
    pending,
    save: saveDraft,
    clear: clearDraft,
    dismiss: dismissDraft,
  } = useWorkoutDraft<ExerciseDraft>(planId, dayIndex);

  /**
   * The loader below must not depend on `t`.
   *
   * `t` changes identity when the language changes, and the effect rebuilds
   * the draft from the plan — so switching language mid-workout discarded
   * every set already logged. The message is read through a ref so the effect
   * depends only on which plan day is open.
   */
  const tRef = useRef(t);
  tRef.current = t;

  const day = useMemo(
    () => (plan && Number.isInteger(dayIdx) ? plan.days[dayIdx] : undefined),
    [plan, dayIdx],
  );

  /** `-1` on a day the plan has nothing scheduled for; no option is marked. */
  const todayIndex = useMemo(() => todaysPlanDayIndex(plan?.days), [plan?.days]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!planId) return;
      try {
        const loaded = await trainingPlanService.getById(planId);
        if (!cancelled) setPlan(loaded);
      } catch {
        if (!cancelled) toast.error(tRef.current('workout.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planId]);

  /**
   * The last time this day was trained, fetched alongside the plan.
   *
   * One document: the newest session filed against this plan under this day's
   * name. Failing to get it is not an error the user needs to hear about —
   * the sheet simply opens on its placeholders, which is how this screen
   * worked before.
   */
  useEffect(() => {
    const dayName = day?.dayName;
    const userId = user?._id;
    if (!planId || !dayName || !userId) return;

    let cancelled = false;

    (async () => {
      try {
        const [session] = await workoutSessionService.getByUserId(userId, {
          planId,
          dayName,
          limit: 1,
        });
        if (!cancelled) setLastSession({ dayName, session: session ?? null });
      } catch {
        if (!cancelled) setLastSession({ dayName, session: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planId, day?.dayName, user?._id]);

  /**
   * Lays it over the sheet, but only while the sheet is still the app's own.
   *
   * The guard is what makes this safe to run late. The request resolves
   * whenever the network says so — after a resumed draft has been adopted,
   * after the user has already logged two sets on a slow connection — and in
   * both of those cases the numbers on screen are the user's and this has
   * nothing to say.
   */
  useEffect(() => {
    if (!day || !lastSession?.session) return;
    if (lastSession.dayName !== day.dayName) return;

    const { session } = lastSession;
    setDraft((current) =>
      hasUserInput(current, notes) ? current : withLastPerformance(current, session),
    );
    // `notes` is read, not tracked: typing a note should not re-run the
    // prefill, and once there is one the guard above has already closed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSession, day]);

  /**
   * The blank sheet for whichever day is open, rebuilt when that changes.
   *
   * Derived during render rather than in an effect, for two reasons.
   *
   * An effect would commit the header first and the sets one paint later, so
   * opening the logger would flash an empty plan day. React re-runs the
   * component before committing when state is set during render, so the sets
   * are there in the first painted frame.
   *
   * And it makes the draft and the storage key impossible to get out of step.
   * The crash net writes `draft` under a key built from `dayIndex`; anything
   * that let one change a render before the other would write one day's
   * workout under another day's key. Here they change together, by
   * construction.
   *
   * Keyed by plan and index rather than by the day object, so that refetching
   * the plan — new objects, same day — does not wipe sets already logged.
   */
  const dayKey = `${planId}:${dayIdx}`;
  const [draftKey, setDraftKey] = useState<string | null>(null);

  if (day && draftKey !== dayKey) {
    setDraftKey(dayKey);
    setDraft(blankDraft(day));
  }

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
    storeBar(barKg);
  }, [barKg]);

  /**
   * Crash net. Only a session with something in it is worth persisting —
   * writing on load would offer to "resume" a workout nobody started.
   */
  useEffect(() => {
    if (loading) return;

    // Deliberately not "is there a number on screen": the sheet fills itself
    // from last week's session now, and persisting that would offer to resume
    // a workout that never started.
    if (!hasUserInput(draft, notes)) return;

    saveDraft({ startedAt: startedAt.current, notes, exercises: draft });
  }, [draft, notes, loading, saveDraft]);

  /**
   * Opens another day of the same plan.
   *
   * The route is the single source of truth for which day is being logged —
   * the crash net keys its storage by it, and so does the loader above — so
   * this navigates rather than holding a second copy in state that the two
   * could disagree about.
   *
   * The sets take care of themselves — they are derived from the open day
   * during render, so they change in the same pass as the route. Notes are
   * not: they belong to the day they were typed against.
   *
   * Nothing is lost by switching. Each day's draft is stored under its own
   * key, so a day with sets already logged offers them back on return.
   *
   * `replace` because the days are one screen the user is adjusting, not four
   * they visited: without it, leaving the logger means tapping back once per
   * day they looked at.
   */
  const switchDay = useCallback(
    (next: number) => {
      if (!planId || next === dayIdx) return;

      setNotes('');
      navigate(`/workout/${planId}/${next}`, { replace: true });
    },
    [navigate, planId, dayIdx],
  );

  /** Adopts the stored draft, clock included, and drops the offer. */
  const resume = useCallback(() => {
    if (!pending) return;

    setDraft(claimTypedSets(pending.exercises));
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

  /**
   * Applies one field of one set, carrying reps and weight down the exercise.
   *
   * A straight set is the same two numbers three or four times over, and the
   * logger used to ask for all of them. Typing the reps and the weight on the
   * first set now fills the sets below it, so the rest of the exercise is one
   * tap on "done" per set.
   *
   * The copy is a suggestion, never a record, and it stops — rather than
   * skipping past — at the first set that is not merely following along. A
   * set is following along while it shows the same number the edited set was
   * showing a moment ago, and has neither been typed into nor finished.
   *
   * That comparison is what lets this coexist with the sheet arriving
   * prefilled from the last session. Both cases fall out of the one rule:
   *
   *   - last week was 60, 60, 60 and today's first set becomes 65. Sets two
   *     and three were showing what set one was showing, so they are a flat
   *     block being restated, and they follow;
   *   - last week was 60, 62.5, 65 and the first set becomes 62.5. Set two
   *     was already showing something else — a ramp the user actually
   *     performed — so the carry stops there and the ramp survives.
   *
   * Without it, one edit at the top of a prefilled exercise would flatten
   * every number the last session recorded, which is real information and
   * nowhere else on the screen.
   *
   * RPE deliberately does not carry: it is a rating of how a set felt, and
   * the whole point of the number is that it changes as the exercise goes on.
   */
  const patchSet = useCallback(
    (ei: number, si: number, patch: Partial<SetDraft>) => {
      setDraft((current) =>
        current.map((exercise, i) => {
          if (i !== ei) return exercise;

          const sets = exercise.sets.map((set, j) =>
            j !== si ? set : { ...set, ...patch },
          );

          if (patch.reps !== undefined) {
            // What this set was showing before the keystroke: the number the
            // sets below are following, if they are following anything.
            const followed = exercise.sets[si].reps;
            sets[si] = { ...sets[si], repsTyped: true };

            for (let j = si + 1; j < sets.length; j += 1) {
              const next = sets[j];
              if (next.done || next.repsTyped || next.reps !== followed) break;
              sets[j] = { ...next, reps: patch.reps };
            }
          }

          if (patch.weight !== undefined) {
            const followed = exercise.sets[si].weight;
            sets[si] = { ...sets[si], weightTyped: true };

            for (let j = si + 1; j < sets.length; j += 1) {
              const next = sets[j];
              if (next.done || next.weightTyped || next.weight !== followed) {
                break;
              }
              sets[j] = { ...next, weight: patch.weight };
            }
          }

          return { ...exercise, sets };
        }),
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

  /**
   * Starts a drop on a set, seeded from the weight above it.
   *
   * Seeded rather than blank because a drop is *always* lighter than what came
   * before, so an empty box is one the user has to fill in from memory of a
   * number already on screen. It stays editable — the seed is a starting point,
   * not a claim about what they did.
   */
  const addDrop = useCallback((ei: number, si: number) => {
    setDraft((current) =>
      current.map((exercise, index) => {
        if (index !== ei) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, setIndex) => {
            if (setIndex !== si) return set;

            const drops = set.drops ?? [];
            const previous =
              drops.length > 0
                ? drops[drops.length - 1].weight
                : set.weight || String(set.targetWeight);

            return { ...set, drops: [...drops, { reps: '', weight: previous }] };
          }),
        };
      }),
    );
  }, []);

  const patchDrop = useCallback(
    (ei: number, si: number, di: number, patch: Partial<DropDraft>) => {
      setDraft((current) =>
        current.map((exercise, index) =>
          index !== ei
            ? exercise
            : {
                ...exercise,
                sets: exercise.sets.map((set, setIndex) =>
                  setIndex !== si
                    ? set
                    : {
                        ...set,
                        drops: (set.drops ?? []).map((drop, dropIndex) =>
                          dropIndex === di ? { ...drop, ...patch } : drop,
                        ),
                      },
                ),
              },
        ),
      );
    },
    [],
  );

  const removeDrop = useCallback((ei: number, si: number, di: number) => {
    setDraft((current) =>
      current.map((exercise, index) =>
        index !== ei
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set, setIndex) => {
                if (setIndex !== si) return set;

                const drops = (set.drops ?? []).filter((_, i) => i !== di);
                // Back to undefined rather than [], so the set stops being a
                // drop set entirely once the last reduction is removed.
                return { ...set, drops: drops.length > 0 ? drops : undefined };
              }),
            },
      ),
    );
  }, []);

  const addSet = useCallback((ei: number) => {
    setDraft((current) =>
      current.map((exercise, i) => {
        if (i !== ei) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          // An extra set inherits the last one's targets — the common case is
          // "one more like that" — and, untyped, the numbers actually put in
          // it, the same way a set carries down to the one below it.
          sets: [
            ...exercise.sets,
            {
              targetReps: last?.targetReps ?? 0,
              targetWeight: last?.targetWeight ?? 0,
              reps: last?.reps ?? '',
              weight: last?.weight ?? '',
              repsTyped: false,
              weightTyped: false,
              rpe: '',
              done: false,
            },
          ],
        };
      }),
    );
  }, []);

  /**
   * Swaps one exercise for another **in this session only**.
   *
   * The plan is left alone on purpose: the workout deviated from it, and that
   * is exactly what a session record is for. Logged sets are kept — the
   * targets came from the plan either way, and discarding work already done
   * because the rack was busy would be the worst possible response.
   */
  const swapExercise = useCallback(
    (ei: number, next: { name: string; muscleGroup?: string }) => {
      setDraft((current) =>
        current.map((exercise, i) =>
          i !== ei
            ? exercise
            : {
                ...exercise,
                name: next.name,
                muscleGroup: next.muscleGroup ?? exercise.muscleGroup,
              },
        ),
      );
    },
    [],
  );

  /**
   * The line that says where the numbers on screen came from.
   *
   * Derived rather than stored, which gets three behaviours for free: it is
   * shown exactly when the prefill was applied and not when it was declined
   * for a resumed draft, it clears itself the moment the user types — at
   * which point the numbers are theirs and the provenance is noise — and it
   * cannot outlive a switch to a day that has never been trained.
   */
  const filledFrom = useMemo(() => {
    if (!day || lastSession?.dayName !== day.dayName) return null;
    if (!lastSession.session || hasUserInput(draft, notes)) return null;

    return new Date(lastSession.session.performedAt).toLocaleDateString(
      i18n.language,
      { day: 'numeric', month: 'short' },
    );
  }, [lastSession, day, draft, notes, i18n.language]);

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
          .map((set) => {
            // A drop with no reps typed is one the user started and did not
            // perform — dropped rather than sent as 0, which would dilute the
            // volume figure with work that never happened.
            const drops = (set.drops ?? [])
              .filter((drop) => Number(drop.reps) > 0)
              .map((drop) => ({
                reps: Number(drop.reps) || 0,
                weight: Number(drop.weight) || 0,
              }));

            return {
              reps: Number(set.reps) || 0,
              weight: Number(set.weight) || 0,
              // Omitted rather than sent as 0: the server validates 1–10, and
              // "not reported" is a real answer that must not become a value.
              ...(set.rpe ? { rpe: Number(set.rpe) } : {}),
              ...(drops.length > 0 ? { drops } : {}),
            };
          }),
      }))
      .filter((exercise) => exercise.sets.length > 0);

    const payload = {
      // Minted before the first attempt, not after a failure: a request can
      // succeed on the server and still fail on the wire, and only a key that
      // already travelled with it makes the retry a no-op instead of a
      // duplicate workout.
      clientId: mintClientId(),
      planId: plan?._id,
      planTitle: plan?.title,
      dayName: day?.dayName,
      durationMinutes: minutesSince(startedAt.current),
      notes: notes.trim() || undefined,
      exercises,
    };

    setSaving(true);
    try {
      try {
        await workoutSessionService.create(payload);
      } catch (error) {
        // Only a request that never landed is queueable. A rejection from the
        // server will never become valid by being sent again, and pretending
        // it succeeded would lose the workout just as thoroughly.
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status && status !== 401) throw error;

        await enqueue(payload.clientId, payload);
        clearDraft();
        toast.success(t('workout.savedOffline'));
        navigate('/');
        return;
      }

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
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {plan.title}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              {day.dayName}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-on-surface-variant">
              <StitchIcon name="timer" size={15} />
              {t('workout.elapsed', { minutes: elapsed })}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {completedSets}/{totalSets}
              </span>
              {t('workout.setsDone')}
            </p>
            {filledFrom && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                <StitchIcon name="history" size={14} />
                {t('workout.filledFromLast', { date: filledFrom })}
              </p>
            )}
          </div>

          {/* One line on a phone would be four controls in 350px. Full width
              and allowed to wrap instead, which puts the day and the bar on
              one line and the finish button on its own. */}
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            {/* The day being logged, defaulting to whichever the dashboard
                sent us to — today's. Offered because the plan's weekday is a
                schedule, not a rule: the gym is busy, Tuesday's session gets
                done on Wednesday, and the log should record the workout that
                happened rather than the one the calendar expected. */}
            {plan.days.length > 1 && (
              <label className="flex w-full min-w-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant sm:w-auto">
                {t('workout.planDay')}
                <select
                  value={dayIdx}
                  aria-label={t('workout.planDay')}
                  onChange={(e) => switchDay(Number(e.target.value))}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2 text-sm font-bold normal-case tracking-normal text-on-surface outline-none focus:border-primary sm:w-44 sm:flex-none"
                >
                  {plan.days.map((option, index) => (
                    <option key={`${option.dayName}-${index}`} value={index}>
                      {index === todayIndex
                        ? t('workout.planDayToday', { day: option.dayName })
                        : option.dayName}
                    </option>
                  ))}
                </select>
              </label>
            )}

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
              className="ms-auto rounded-lg bg-primary-gradient px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
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
              className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3 sm:p-5"
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
                    className={`rounded-lg border p-2 transition-colors ${
                      set.done
                        ? 'border-success/40 bg-success/5'
                        : 'border-transparent bg-surface-container-low'
                    }`}
                  >
                   <div className={SET_ROW}>
                    {/* `h-12` so that aligning the row to the bottom of the
                        inputs centres the number against them, rather than
                        dropping it to the floor of a taller cell. */}
                    <span className="flex h-12 w-7 shrink-0 items-center justify-center text-xs font-black tabular-nums text-on-surface-variant">
                      {si + 1}
                    </span>

                    <label className={FIELD}>
                      <span className={FIELD_CAPTION}>{t('workout.reps')}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={set.reps}
                        placeholder={String(set.targetReps)}
                        onChange={(e) =>
                          patchSet(ei, si, { reps: e.target.value })
                        }
                        className={`${FIELD_CONTROL} sm:w-16`}
                      />
                    </label>

                    <label className={FIELD}>
                      <span className={FIELD_CAPTION}>
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
                        className={`${FIELD_CONTROL} sm:w-20`}
                      />
                    </label>

                    {/* Optional on purpose. RPE is the input every future
                        fatigue or deload signal reads, but a required field
                        would turn a two-tap set into a three-tap one. Which is
                        also why it is the field that drops to the second line
                        on a phone. */}
                    <label className={`${FIELD} col-start-2 row-start-2`}>
                      <span className={FIELD_CAPTION}>{t('workout.rpe')}</span>
                      <select
                        value={set.rpe}
                        aria-label={t('workout.rpeFor', { number: si + 1 })}
                        onChange={(e) =>
                          patchSet(ei, si, { rpe: e.target.value })
                        }
                        className={`${FIELD_CONTROL} px-1 sm:w-16`}
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
                      className={`col-start-4 row-start-1 ms-auto flex h-12 w-14 items-center justify-center rounded-lg transition-[background-color] duration-[180ms] ${set.done ? 'animate-set-pop ' : ''}${
                        set.done
                          ? 'bg-success text-on-success shadow-[0_0_8px_0_var(--color-success)]'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary'
                      }`}
                    >
                      <StitchIcon name="check" size={22} />
                    </button>

                    {/* Reads what was typed, falling back to the plan's
                        target — the question at the rack is about the bar you
                        are walking up to, not the one you already lifted.
                        Indented under the inputs on desktop, where it sits on
                        its own line under the whole row; already in its own
                        column on a phone, so the indent would only push it
                        into a wrap. */}
                    <PlateCalculator
                      weightKg={Number(set.weight) || set.targetWeight}
                      barKg={barKg}
                      className="col-start-3 col-span-2 row-start-2 ps-0 sm:ps-9"
                    />
                   </div>

                    {/* Drops sit inside the set's own block, indented and
                        rule-connected, because a drop set is one set — showing
                        them as siblings would make three entries out of one and
                        put the set count out by two. */}
                    {(set.drops?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-col gap-2 border-s-2 border-warning/40 ps-3">
                        {set.drops?.map((drop, di) => (
                          <div key={di} className={DROP_ROW}>
                            <span className="flex h-11 w-7 shrink-0 items-center justify-center text-[10px] font-black uppercase tracking-wider text-warning">
                              {t('workout.dropShort')}
                            </span>

                            <label className={FIELD}>
                              <span className={FIELD_CAPTION}>
                                {t('workout.reps')}
                              </span>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                value={drop.reps}
                                aria-label={t('workout.dropRepsFor', {
                                  set: si + 1,
                                  drop: di + 1,
                                })}
                                onChange={(e) =>
                                  patchDrop(ei, si, di, { reps: e.target.value })
                                }
                                className={`${FIELD_CONTROL} h-11 sm:w-16`}
                              />
                            </label>

                            <label className={FIELD}>
                              <span className={FIELD_CAPTION}>
                                {t('workout.weight')}
                              </span>
                              <input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="0.5"
                                value={drop.weight}
                                aria-label={t('workout.dropWeightFor', {
                                  set: si + 1,
                                  drop: di + 1,
                                })}
                                onChange={(e) =>
                                  patchDrop(ei, si, di, {
                                    weight: e.target.value,
                                  })
                                }
                                className={`${FIELD_CONTROL} h-11 sm:w-20`}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => removeDrop(ei, si, di)}
                              aria-label={t('workout.removeDrop', {
                                drop: di + 1,
                              })}
                              className="ms-auto flex h-11 w-11 items-center justify-center rounded-lg text-error hover:bg-error/10"
                            >
                              <StitchIcon name="close" size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Capped at the six the server accepts, so the limit is
                        felt as a missing button rather than as a rejected
                        save after the work is already done. */}
                    {(set.drops?.length ?? 0) < 6 && (
                      <button
                        type="button"
                        onClick={() => addDrop(ei, si)}
                        className="mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-warning transition-colors hover:bg-warning/10"
                      >
                        <StitchIcon name="trending_down" size={14} />
                        {t('workout.addDrop')}
                      </button>
                    )}
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

              {/* Draws nothing unless the catalogue recognises the exercise. */}
              <SwapExercise
                exerciseName={exercise.name}
                onSwap={(next) => swapExercise(ei, next)}
              />
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

      {/* The bar carries the session clock too. `startedAt` is a ref, but
          every write to it is paired with a `setElapsed`, so the new value
          reaches the bar in the same render as the one that changed it. */}
      <RestTimer sessionStartedAt={startedAt.current} />
    </AppLayout>
  );
}

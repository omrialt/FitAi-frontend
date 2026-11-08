/**
 * The athlete's "Today" screen (redesign, direction B).
 *
 * One question per screen: what do I do now. The old dashboard answered it
 * somewhere among nine cards; this keeps four blocks and moves the rest to
 * Progress, where they are asked for rather than pushed:
 *
 *   1. A One UI-style large title — the top third is for reading, so
 *      everything tappable lands in thumb reach below it. When it scrolls away,
 *      the app bar picks the title up (see `data-today-collapsed` in
 *      AppLayout.css).
 *   2. The next workout, on the tonal primary fill, with the one primary
 *      action on the screen.
 *   3. Today's nutrition: what is left, not what was eaten.
 *   4. The day as a timeline — weigh-in, meals, the workout — instead of a
 *      separate card for each.
 *   Then the coach's single most relevant signal (deload / overload), which
 *   render nothing when there is nothing to say.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconArrowNarrowRight,
  IconClock,
  IconPlayerPlayFilled,
  IconStack2,
} from '@tabler/icons-react';

import { DeloadCard } from '../workout/DeloadCard';
import { OverloadCard } from '../workout/OverloadCard';
import { mealLogService, localDayString } from '../../services/meal-log.service';
import { MEAL_LOGGED_EVENT } from '../nutrition/MealLogForm';
import { OPEN_MEAL_SHEET_EVENT } from '../nutrition/MealLogSheet';
import { todaysPlanDayIndex } from '../../utils/planDay';
import type { DailyIntake } from '../../types/meal-log.types';
import type { TrainingPlan } from '../../types/training-plan.types';
import type { CurrentStatus } from '../../types/current-status.types';
import type { PhysicalData } from '../../types/physical-data.types';

interface TodayViewProps {
  userId: string;
  fullName: string;
  plan: TrainingPlan | null;
  planReady: boolean;
  currentStatus: CurrentStatus | null;
  latestPhysicalData: PhysicalData | null;
  previousWeight?: number | null;
}

function isToday(value: string | Date | null | undefined): boolean {
  if (!value) return false;
  return localDayString(new Date(value)) === localDayString();
}

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.goodMorning';
  if (hour < 18) return 'dashboard.goodAfternoon';
  return 'dashboard.goodEvening';
}

/* ── 1. Large title ─────────────────────────────────────────────────────── */

function TodayHeader({ name, summary }: { name: string; summary: string }) {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  // Hands the title to the app bar once the large one has scrolled away.
  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) delete root.dataset.todayCollapsed;
        else root.dataset.todayCollapsed = '';
      },
      { rootMargin: '-64px 0px 0px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete root.dataset.todayCollapsed;
    };
  }, []);

  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header className="today-head flex flex-col justify-end gap-1 pb-2">
      <p className="text-sm text-on-surface-variant">{date}</p>
      <h1 ref={ref} className="text-[length:var(--text-2xl)] leading-tight text-on-surface">
        {t(greetingKey())}, {name}
      </h1>
      <p className="text-sm text-on-surface-variant">{summary}</p>
    </header>
  );
}

/* ── 2. Next workout ────────────────────────────────────────────────────── */

function NextWorkoutCard({
  plan,
  doneToday,
}: {
  plan: TrainingPlan | null;
  doneToday: boolean;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  if (!plan || !plan.days?.length) {
    return (
      <section className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-surface-container-low px-4 py-8 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-[24px] bg-primary-container text-on-primary-container">
          <IconStack2 size={36} stroke={1.75} aria-hidden="true" />
        </span>
        <h2 className="text-[length:var(--text-xl)] text-on-surface">{t('today.noPlanTitle')}</h2>
        <p className="max-w-[30ch] text-sm text-on-surface-variant">{t('today.noPlanBody')}</p>
        <button
          type="button"
          onClick={() => navigate('/my-trainings')}
          className="bg-primary-gradient mt-1 min-h-12 w-full rounded-[var(--radius-control)] text-base font-bold"
        >
          {t('today.choosePlan')}
        </button>
      </section>
    );
  }

  const todayIdx = todaysPlanDayIndex(plan.days);
  const isRest = todayIdx < 0;
  // On a rest day, point at the next scheduled day so the card still answers
  // "what next" — and offer to train anyway, which is the plan's first day.
  const nextIdx = isRest
    ? (() => {
        const dow = new Date().getDay();
        let best = 0;
        let bestGap = 8;
        plan.days.forEach((d, i) => {
          const gap = (d.dayOfWeek - dow + 7) % 7 || 7;
          if (gap < bestGap) {
            bestGap = gap;
            best = i;
          }
        });
        return best;
      })()
    : todayIdx;
  const day = plan.days[nextIdx];
  const sets = day.exercises.reduce((n, e) => n + e.sets.length, 0);
  const minutes = Math.max(15, Math.round((sets * 2.75) / 5) * 5);

  const eyebrow = doneToday
    ? t('today.doneToday')
    : isRest
      ? t('today.restDayNext', {
          day: new Intl.DateTimeFormat(i18n.language, { weekday: 'long' }).format(
            nextWeekday(day.dayOfWeek),
          ),
        })
      : t('today.todaysWorkout');

  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-primary-container px-4 pb-4 pt-5 text-on-primary-container">
      <div className="flex flex-col gap-1">
        <span className="text-sm opacity-85">{eyebrow}</span>
        {/* <bdi>: plan and day names are often Latin inside Hebrew text, and
            without isolation "3-Day Strength" renders as "Day Strength-3". */}
        <h2 className="text-[length:var(--text-xl)] leading-tight"><bdi>{day.dayName}</bdi></h2>
        <p className="truncate text-sm opacity-85"><bdi>{plan.title}</bdi></p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90">
        <span className="flex items-center gap-1">
          <IconClock size={18} stroke={1.75} aria-hidden="true" />
          {t('today.minutes', { count: minutes })}
        </span>
        <span className="flex items-center gap-1">
          <IconStack2 size={18} stroke={1.75} aria-hidden="true" />
          {t('today.exercisesSets', { exercises: day.exercises.length, sets })}
        </span>
      </div>
      <button
        type="button"
        onClick={() => navigate(`/workout/${plan._id}/${isRest ? 0 : nextIdx}`)}
        className="bg-primary-gradient flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] text-base font-bold transition-transform active:scale-[0.97]"
      >
        <IconPlayerPlayFilled size={18} aria-hidden="true" />
        {isRest ? t('today.trainAnyway') : doneToday ? t('today.trainAgain') : t('today.start')}
      </button>
      <button
        type="button"
        onClick={() => navigate(`/training-plans/${plan._id}`)}
        className="-mt-1 flex min-h-11 items-center justify-center gap-1 self-center text-sm font-bold underline-offset-4 hover:underline"
      >
        {t('today.viewPlan')}
        {/* Directional: mirrored in RTL by the global `.flip-x` rule. */}
        <IconArrowNarrowRight size={16} aria-hidden="true" className="flip-x" />
      </button>
    </section>
  );
}

function nextWeekday(dayOfWeek: number): Date {
  const d = new Date();
  const gap = (dayOfWeek - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + gap);
  return d;
}

/* ── 3. Nutrition ───────────────────────────────────────────────────────── */

const RING_R = 38;
const RING_C = 2 * Math.PI * RING_R;

function NutritionToday({ intake }: { intake: DailyIntake | null }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!intake) {
    return <div className="skeleton h-[136px] w-full rounded-[var(--radius-card)]" aria-hidden="true" />;
  }

  const { consumed, target, remaining } = intake;
  const kcalTarget = target?.calories ?? 0;
  const pct = kcalTarget ? Math.min(1, consumed.calories / kcalTarget) : 0;
  const left = remaining?.calories ?? null;

  const macros = [
    { key: 'protein', label: t('nutrition.protein'), color: 'var(--color-chart-1)' },
    { key: 'carbs', label: t('nutrition.carbs'), color: 'var(--color-chart-2)' },
    { key: 'fat', label: t('nutrition.fat'), color: 'var(--color-chart-3)' },
  ] as const;

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface-container-low p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-on-surface">{t('today.nutrition')}</h2>
        {kcalTarget > 0 && (
          <span className="text-sm text-on-surface-variant tabular-nums" dir="ltr">
            {consumed.calories.toLocaleString()} / {kcalTarget.toLocaleString()}
          </span>
        )}
      </div>

      {kcalTarget > 0 ? (
        <div className="grid grid-cols-[auto_1fr] items-center gap-4">
          <div className="relative h-[88px] w-[88px]">
            <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="44" cy="44" r={RING_R} fill="none" stroke="var(--color-surface-container-highest)" strokeWidth="9" />
              <circle
                cx="44"
                cy="44"
                r={RING_R}
                fill="none"
                stroke={left !== null && left < 0 ? 'var(--color-warning)' : 'var(--color-primary)'}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - pct)}
                style={{ transition: 'stroke-dashoffset 600ms var(--ease-standard)' }}
              />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center leading-tight">
              <span className="text-lg font-extrabold tabular-nums text-on-surface">
                {Math.abs(left ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {left !== null && left < 0 ? t('today.over') : t('today.left')}
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5">
            {macros.map(({ key, label, color }) => {
              const eaten = consumed[key];
              const goal = target?.[key] ?? 0;
              return (
                <li key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface">{label}</span>
                    <span className="text-on-surface-variant tabular-nums" dir="ltr">
                      {eaten} / {goal} g
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${goal ? Math.min(100, (eaten / goal) * 100) : 0}%`, background: color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-on-surface-variant">{t('today.noNutritionTarget')}</p>
          <button
            type="button"
            onClick={() => navigate('/nutrition-plans')}
            className="min-h-11 self-start rounded-[var(--radius-control)] bg-surface-container-high px-4 text-sm font-bold text-on-surface"
          >
            {t('today.chooseNutritionPlan')}
          </button>
        </div>
      )}
    </section>
  );
}

/* ── 4. The day as a timeline ───────────────────────────────────────────── */

interface TimelineItem {
  key: string;
  time: Date | null;
  title: string;
  detail: string;
  value?: string;
  state: 'done' | 'now' | 'later';
}

function DayTimeline({ items, onLogMeal }: { items: TimelineItem[]; onLogMeal: () => void }) {
  const { t, i18n } = useTranslation();
  const fmt = new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-surface-container-low p-4">
      <h2 className="text-base font-bold text-on-surface">{t('today.schedule')}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{t('today.scheduleEmpty')}</p>
      ) : (
        <ol className="flex flex-col">
          {items.map((item, i) => (
            <li key={item.key} className="grid grid-cols-[3rem_1.25rem_1fr_auto] items-start gap-2">
              <time className="pt-0.5 text-sm tabular-nums text-on-surface-variant" dir="ltr">
                {item.time ? fmt.format(item.time) : '—'}
              </time>
              <span className="flex h-full flex-col items-center" aria-hidden="true">
                <span
                  className={`mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                    item.state === 'done'
                      ? 'border-success bg-success'
                      : item.state === 'now'
                        ? 'border-primary bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]'
                        : 'border-outline bg-surface-container-low'
                  }`}
                />
                {i < items.length - 1 && <span className="min-h-9 w-0.5 flex-1 bg-outline-variant" />}
              </span>
              <div className="min-w-0 pb-3">
                <p className="font-semibold text-on-surface"><bdi>{item.title}</bdi></p>
                <p className="truncate text-sm text-on-surface-variant">{item.detail}</p>
              </div>
              {item.value && (
                <span className="pt-0.5 text-sm font-semibold tabular-nums text-on-surface-variant" dir="ltr">
                  {item.value}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        onClick={onLogMeal}
        className="min-h-11 self-start rounded-[var(--radius-control)] bg-surface-container-high px-4 text-sm font-bold text-on-surface"
      >
        + {t('today.logMeal')}
      </button>
    </section>
  );
}

/* ── Screen ─────────────────────────────────────────────────────────────── */

export function TodayView({
  userId,
  fullName,
  plan,
  planReady,
  currentStatus,
  latestPhysicalData,
  previousWeight,
}: TodayViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [intake, setIntake] = useState<DailyIntake | null>(null);

  // Refetched whenever a meal is logged or undone from the sheet.
  const [mealsVersion, setMealsVersion] = useState(0);
  useEffect(() => {
    const bump = () => setMealsVersion((v) => v + 1);
    window.addEventListener(MEAL_LOGGED_EVENT, bump);
    return () => window.removeEventListener(MEAL_LOGGED_EVENT, bump);
  }, []);

  useEffect(() => {
    let cancelled = false;
    mealLogService
      .getDay(localDayString())
      .then((d) => !cancelled && setIntake(d))
      .catch(() => {
        // A failed read still leaves the rest of the screen useful; show the
        // block as having no target rather than a spinner forever.
        if (!cancelled)
          setIntake({
            localDay: localDayString(),
            meals: [],
            consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            target: null,
            remaining: null,
            planId: null,
            planTitle: null,
            calorieTargetMismatch: null,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [mealsVersion]);

  const doneToday = isToday(currentStatus?.lastWorkoutDate ?? null);
  const todayIdx = plan ? todaysPlanDayIndex(plan.days) : -1;

  const items = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];
    if (latestPhysicalData && isToday(latestPhysicalData.dateRecorded)) {
      const delta =
        previousWeight != null ? Math.round((latestPhysicalData.weightKg - previousWeight) * 10) / 10 : null;
      list.push({
        key: 'weigh',
        time: new Date(latestPhysicalData.createdAt || latestPhysicalData.dateRecorded),
        title: t('today.weighIn'),
        detail: t('today.kg', { value: latestPhysicalData.weightKg }),
        value: delta != null && delta !== 0 ? `${delta > 0 ? '+' : '−'}${Math.abs(delta)}` : undefined,
        state: 'done',
      });
    }
    for (const meal of intake?.meals ?? []) {
      list.push({
        key: meal.id,
        time: new Date(meal.loggedAt),
        title: meal.label || t(`mealLog.meal_${meal.mealType}`),
        detail: meal.foods.map((f) => f.name).join(', '),
        value: String(Math.round(meal.totals.calories)),
        state: 'done',
      });
    }
    if (plan && todayIdx >= 0) {
      const day = plan.days[todayIdx];
      list.push({
        key: 'workout',
        time: doneToday && currentStatus?.lastWorkoutDate ? new Date(currentStatus.lastWorkoutDate) : null,
        title: day.dayName,
        detail: doneToday ? t('today.workoutDone') : t('today.workoutPlanned'),
        state: doneToday ? 'done' : 'now',
      });
    }
    // Timed entries in order; the still-to-do workout (no time) goes last.
    return list.sort((a, b) => (a.time?.getTime() ?? Infinity) - (b.time?.getTime() ?? Infinity));
  }, [latestPhysicalData, previousWeight, intake, plan, todayIdx, doneToday, currentStatus, t]);

  const summary = !plan
    ? t('today.summaryNoPlan')
    : todayIdx < 0
      ? t('today.summaryRest')
      : doneToday
        ? t('today.summaryDone')
        : t('today.summaryWorkout');

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-4">
      <TodayHeader name={fullName.split(' ')[0]} summary={summary} />
      {planReady ? (
        <NextWorkoutCard plan={plan} doneToday={doneToday} />
      ) : (
        <div className="skeleton h-[236px] w-full rounded-[var(--radius-card)]" aria-hidden="true" />
      )}
      <NutritionToday intake={intake} />
      <DayTimeline items={items} onLogMeal={() => window.dispatchEvent(new Event(OPEN_MEAL_SHEET_EVENT))} />
      <DeloadCard userId={userId} />
      <OverloadCard userId={userId} />
      <button
        type="button"
        onClick={() => navigate('/physical-data?tab=training')}
        className="min-h-12 rounded-[var(--radius-control)] text-sm font-bold text-primary"
      >
        {t('today.allProgress')}
      </button>
    </div>
  );
}

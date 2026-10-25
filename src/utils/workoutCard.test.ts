import { describe, it, expect } from 'vitest';
import { buildCardModel, clip, weightByReps, CARD_SIZE } from './workoutCard';
import type { WorkoutSessionSummary } from '../types/workout-session.types';

const labels = {
  duration: 'duration',
  volume: 'volume',
  sets: 'sets',
  minutes: 'min',
  kg: 'kg',
  topSet: 'top',
  records: 'records',
  record: 'PB',
  freeSession: 'free',
};

const record = (exercise: string, weight: number) => ({
  exercise,
  weight,
  reps: 5,
  estimatedOneRepMax: weight * 1.17,
  previousBest: weight,
});

const summary: WorkoutSessionSummary = {
  performedAt: '2026-10-25T09:00:00Z',
  dayName: 'Legs',
  planTitle: 'PPL',
  durationMinutes: 52,
  totalSets: 18,
  totalReps: 142,
  volumeKg: 18420.5,
  topSet: { exercise: 'Squat', weight: 110, reps: 5 },
  records: [record('Squat', 110), record('Leg press', 220), record('Lunge', 24), record('Calf', 80)],
};

const build = (overrides: Partial<Parameters<typeof buildCardModel>[1]> = {}) =>
  buildCardModel(summary, { format: 'feed', showName: false, locale: 'en', labels, ...overrides });

describe('buildCardModel', () => {
  it('sizes the canvas for feed and story', () => {
    expect(build()).toMatchObject(CARD_SIZE.feed);
    expect(build({ format: 'story' })).toMatchObject(CARD_SIZE.story);
  });

  // Nothing about a person is shared without a choice.
  it('leaves the name off unless it is switched on', () => {
    expect(build({ name: 'Dana Cohen' }).name).toBeNull();
    expect(build({ name: 'Dana Cohen', showName: true }).name).toBe('Dana Cohen');
  });

  it('shows at most three records', () => {
    expect(build().records).toHaveLength(3);
  });

  it('keeps "110×5" left-to-right inside Hebrew', () => {
    expect(weightByReps(110, 5)).toBe('⁦110×5⁩');
    expect(build().topSet).toBe(`Squat · ${weightByReps(110, 5)}`);
  });

  it('rounds volume to whole kilos and drops a missing duration', () => {
    const model = build();
    expect(model.stats.map((s) => s.value)).toEqual(['52', '18,421', '18']);

    const noDuration = buildCardModel(
      { ...summary, durationMinutes: undefined },
      { format: 'feed', showName: false, locale: 'en', labels },
    );
    expect(noDuration.stats.map((s) => s.label)).toEqual(['volume', 'sets']);
  });

  it('falls back to the plan, then "free session", for the title', () => {
    expect(
      buildCardModel({ ...summary, dayName: undefined }, { format: 'feed', showName: false, locale: 'en', labels })
        .title,
    ).toBe('PPL');
    expect(
      buildCardModel(
        { ...summary, dayName: undefined, planTitle: undefined },
        { format: 'feed', showName: false, locale: 'en', labels },
      ).title,
    ).toBe('free');
  });
});

describe('clip', () => {
  it('cuts long text with an ellipsis', () => {
    expect(clip('abcdefghij', 5)).toBe('abcd…');
    expect(clip('abc', 5)).toBe('abc');
  });
});

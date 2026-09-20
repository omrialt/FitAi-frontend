import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { ClientAlertCard } from './ClientAlertCard';
import { splitByAttention, daysSince } from './alerts';
import type { TrainerDashboardRow } from '../../types/trainer-dashboard.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  }),
}));

/** Mantine components read their props through the provider's theme. */
const render = (ui: React.ReactElement) =>
  rtlRender(<MantineProvider>{ui}</MantineProvider>);

const row = (over: Partial<TrainerDashboardRow> = {}): TrainerDashboardRow => ({
  clientId: 'client-1',
  fullName: 'Dana Client',
  email: 'dana@example.com',
  avatarUrl: null,
  lastWorkoutAt: '2026-09-18T08:00:00.000Z',
  daysSinceLastWorkout: 2,
  sessionsLast7: 2,
  sessionsLast30: 9,
  totalSessions: 40,
  adherencePercent: 75,
  fatigue: 'ok',
  weight: {
    latestKg: 78.5,
    latestAt: '2026-09-18T08:00:00.000Z',
    changeKg: -1.5,
    spanDays: 30,
    measurements: 4,
  },
  totalMeasurements: 4,
  hasActivePlan: true,
  alerts: [],
  ...over,
});

describe('ClientAlertCard', () => {
  it('shows one badge per alert', () => {
    render(
      <ClientAlertCard
        row={row({
          alerts: [
            { code: 'missed_workouts', severity: 'warn', since: null },
            { code: 'no_measurements', severity: 'info' },
          ],
        })}
        onOpen={() => {}}
      />,
    );

    expect(
      screen.getByText('trainerDashboard.alerts.missed_workouts'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('trainerDashboard.alerts.no_measurements'),
    ).toBeInTheDocument();
  });

  /**
   * The distinction the whole screen rests on: a client who has never trained
   * must not render as "0 days ago", which is what a plain number would give.
   */
  it('says never, not zero days, for a client who has never trained', () => {
    render(
      <ClientAlertCard
        row={row({
          daysSinceLastWorkout: null,
          lastWorkoutAt: null,
          totalSessions: 0,
          alerts: [{ code: 'never_trained', severity: 'warn' }],
        })}
        onOpen={() => {}}
      />,
    );

    expect(screen.getByText('trainerDashboard.never')).toBeInTheDocument();
    expect(screen.queryByText(/daysAgo.*"count":0/)).not.toBeInTheDocument();
  });

  it('renders a dash rather than a number it does not have', () => {
    render(
      <ClientAlertCard
        row={row({ adherencePercent: null, weight: null })}
        onOpen={() => {}}
      />,
    );

    // Adherence and weight both unknown — two dashes, no invented zeros.
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('opens the client it was given, not the one before it', () => {
    const onOpen = vi.fn();
    render(
      <ClientAlertCard row={row({ clientId: 'client-9' })} onOpen={onOpen} />,
    );

    screen.getByText('clients.viewClient').click();
    expect(onOpen).toHaveBeenCalledWith('client-9');
  });
});

describe('splitByAttention', () => {
  it('separates alerted clients from quiet ones and keeps the server order', () => {
    const rows = [
      row({ clientId: 'a', alerts: [{ code: 'no_active_plan', severity: 'warn' }] }),
      row({ clientId: 'b', alerts: [] }),
      row({ clientId: 'c', alerts: [{ code: 'weight_stalled', severity: 'info' }] }),
    ];

    const { needsAttention, quiet } = splitByAttention(rows);

    expect(needsAttention.map((r) => r.clientId)).toEqual(['a', 'c']);
    expect(quiet.map((r) => r.clientId)).toEqual(['b']);
  });
});

describe('daysSince', () => {
  it('returns null for a missing or unparseable date rather than a number', () => {
    expect(daysSince(null)).toBeNull();
    expect(daysSince(undefined)).toBeNull();
    expect(daysSince('not a date')).toBeNull();
  });

  it('counts whole days', () => {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(daysSince(threeDaysAgo)).toBe(3);
  });
});

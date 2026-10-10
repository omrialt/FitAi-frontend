import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TargetCard } from './TargetCard';
import { orderTargets } from '../helpers/orderTargets';
import type {
  PhysicalTarget,
  TargetProgress,
} from '../../../../types/physical-target.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'en' },
  }),
}));

const target = (over: Partial<PhysicalTarget> = {}): PhysicalTarget => ({
  _id: 't1',
  userId: 'u1',
  name: 'Summer',
  targetDate: '2026-12-01T00:00:00.000Z',
  targetValues: { weightKg: 80, waist: 85 },
  startValues: { weightKg: 90, waist: 95 },
  startDate: '2026-09-01T00:00:00.000Z',
  status: 'active',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...over,
});

const progress = (pcts: [number, number], daysRemaining = 30): TargetProgress => ({
  targetId: 't1',
  name: 'Summer',
  targetDate: '2026-12-01T00:00:00.000Z',
  daysRemaining,
  status: 'active',
  metrics: [
    { metric: 'weightKg', start: 90, current: 85, target: 80, percentComplete: pcts[0] },
    { metric: 'waist', start: 95, current: 90, target: 85, percentComplete: pcts[1] },
  ],
});

function renderCard(
  t: PhysicalTarget,
  p: TargetProgress | undefined,
  onStatusChange = vi.fn(),
) {
  render(
    <TargetCard
      target={t}
      progress={p}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onStatusChange={onStatusChange}
    />,
  );
  return onStatusChange;
}

describe('TargetCard', () => {
  it('shows one progress row per targeted metric and the time left', () => {
    renderCard(target(), progress([50, 50]));

    expect(screen.getByText('physicalData.weightKgHeader')).toBeInTheDocument();
    expect(screen.getByText('physicalData.waistCm')).toBeInTheDocument();
    expect(screen.getByText(/physicalTargets\.daysRemaining/)).toBeInTheDocument();
  });

  it('says how overdue an active target is', () => {
    renderCard(target(), progress([50, 50], -4));
    expect(screen.getByText(/physicalTargets\.overdue:\{"count":4\}/)).toBeInTheDocument();
  });

  it('marks an active target achieved in one tap', async () => {
    const onStatusChange = renderCard(target(), progress([40, 60]));

    await userEvent.click(screen.getByRole('button', { name: /physicalTargets\.markAchieved/ }));

    expect(onStatusChange).toHaveBeenCalledWith('achieved');
  });

  it('only says every metric is reached when every metric is', () => {
    renderCard(target(), progress([100, 60]));
    expect(screen.queryByText('physicalTargets.allReached')).toBeNull();
  });

  it('offers achieving it first once every metric is at 100%', () => {
    renderCard(target(), progress([100, 100]));
    expect(screen.getByText('physicalTargets.allReached')).toBeInTheDocument();
  });

  it('asks before abandoning, and can be talked out of it', async () => {
    const onStatusChange = renderCard(target(), progress([10, 10]));

    await userEvent.click(screen.getByRole('button', { name: 'physicalTargets.abandon' }));
    expect(onStatusChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'physicalTargets.keep' }));
    expect(onStatusChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'physicalTargets.abandon' }));
    await userEvent.click(screen.getByRole('button', { name: 'physicalTargets.abandonConfirmYes' }));
    expect(onStatusChange).toHaveBeenCalledWith('abandoned');
  });

  it('shows when a closed target was achieved and lets it be reopened', async () => {
    const onStatusChange = renderCard(
      target({ status: 'achieved', closedAt: '2026-10-03T10:00:00.000Z' }),
      progress([100, 100], -2),
    );

    expect(screen.getByText(/physicalTargets\.achievedOn/)).toBeInTheDocument();
    // A finished goal is not "overdue".
    expect(screen.queryByText(/physicalTargets\.overdue/)).toBeNull();
    expect(screen.queryByRole('button', { name: /markAchieved/ })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /physicalTargets\.reactivate/ }));
    expect(onStatusChange).toHaveBeenCalledWith('active');
  });
});

describe('TargetCard — read-only', () => {
  it('hides every action and says who set it', () => {
    render(
      <TargetCard
        target={target({ createdBy: 'client-1' })}
        progress={progress([50, 50])}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        readOnly
        attribution="Set by the client"
      />,
    );

    expect(screen.getByText('Set by the client')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('orderTargets', () => {
  it('puts active targets first by deadline, then closed ones newest first', () => {
    const ordered = orderTargets([
      target({ _id: 'old-closed', status: 'achieved', closedAt: '2026-08-01T00:00:00.000Z' }),
      target({ _id: 'late', targetDate: '2027-01-01T00:00:00.000Z' }),
      target({ _id: 'new-closed', status: 'abandoned', closedAt: '2026-10-01T00:00:00.000Z' }),
      target({ _id: 'soon', targetDate: '2026-11-01T00:00:00.000Z' }),
    ]);

    expect(ordered.map((t) => t._id)).toEqual(['soon', 'late', 'new-closed', 'old-closed']);
  });
});

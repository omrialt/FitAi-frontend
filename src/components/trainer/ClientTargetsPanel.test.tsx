import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { ClientTargetsPanel } from './ClientTargetsPanel';
import physicalTargetService from '../../services/physical-target.service';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: (select: (s: { user: { _id: string } }) => unknown) =>
    select({ user: { _id: 'trainer-1' } }),
}));

vi.mock('../../services/physical-target.service', () => ({
  default: {
    getByUserId: vi.fn(),
    getProgress: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// The modal is the client's own form, already covered where it lives; here it
// only has to hand back what a trainer would type.
vi.mock('../profile/physical-data/targets/TargetModal', () => ({
  TargetModal: ({ opened, onSave }: { opened: boolean; onSave: (d: unknown) => void }) =>
    opened ? (
      <button
        type="button"
        onClick={() =>
          onSave({ targetDate: '2026-12-31T00:00:00.000Z', targetValues: { weightKg: 78 } })
        }
      >
        submit-goal
      </button>
    ) : null,
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const service = physicalTargetService as unknown as Record<string, ReturnType<typeof vi.fn>>;

const goal = (over: Record<string, unknown>) => ({
  _id: 'g',
  userId: 'client-1',
  targetDate: '2026-12-01T00:00:00.000Z',
  targetValues: { weightKg: 78 },
  startDate: '2026-10-01T00:00:00.000Z',
  status: 'active',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...over,
});

function renderPanel() {
  render(
    <MantineProvider>
      <ClientTargetsPanel clientId="client-1" />
    </MantineProvider>,
  );
}

describe('ClientTargetsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getProgress.mockResolvedValue([]);
    service.create.mockResolvedValue({});
  });

  it("sets a goal on the client, not on the trainer", async () => {
    service.getByUserId.mockResolvedValue([]);
    renderPanel();

    expect(await screen.findByText('physicalTargets.clientNoTargets')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /physicalTargets\.setGoal/ }));
    fireEvent.click(screen.getByRole('button', { name: 'submit-goal' }));

    await waitFor(() =>
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'client-1', targetValues: { weightKg: 78 } }),
      ),
    );
    expect(service.getByUserId).toHaveBeenCalledWith('client-1');
  });

  it("lets the trainer manage only the goals they set", async () => {
    service.getByUserId.mockResolvedValue([
      goal({ _id: 'mine', name: 'Trainer goal', createdBy: 'trainer-1' }),
      goal({ _id: 'theirs', name: 'Client goal', createdBy: 'client-1' }),
    ]);
    renderPanel();

    await screen.findByText('Trainer goal');
    expect(screen.getByText('physicalTargets.setByYou')).toBeInTheDocument();
    expect(screen.getByText('physicalTargets.setByClient')).toBeInTheDocument();
    // One goal's worth of actions, not two.
    expect(screen.getAllByRole('button', { name: /physicalTargets\.markAchieved/ })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'common.delete' })).toHaveLength(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render as rtlRender,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { AssignPlanBody } from './AssignPlanModal';
import { trainingPlanService } from '../../services/training-plan.service';
import trainerConnectionService from '../../services/trainer-connection.service';
import type { TrainerConnection } from '../../types/trainer-connection.types';

/**
 * One stable object, not a fresh one per render.
 *
 * The usual inline form returns a new `t` every time, and this component's
 * client-loading effect lists `t` in its dependencies — so an inline mock
 * re-runs the effect on every render and the test dies with "maximum update
 * depth exceeded" for a bug that does not exist in the app, where i18next's
 * `t` is stable.
 */
vi.mock('react-i18next', () => {
  const translation = {
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'he' },
  };
  return { useTranslation: () => translation };
});

vi.mock('../../services/training-plan.service', () => ({
  trainingPlanService: { assignToClients: vi.fn() },
}));

vi.mock('../../services/trainer-connection.service', () => ({
  default: { getClients: vi.fn() },
}));

const render = (ui: React.ReactElement) =>
  rtlRender(<MantineProvider>{ui}</MantineProvider>);

const connection = (
  id: string,
  name: string,
  status: TrainerConnection['status'] = 'accepted',
): TrainerConnection =>
  ({
    _id: `conn-${id}`,
    trainerId: 'trainer-1',
    clientId: { _id: id, fullName: name, email: `${id}@example.com` },
    status,
    initiatedBy: 'trainer',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  }) as TrainerConnection;

describe('AssignPlanBody', () => {
  beforeEach(() => {
    // `restoreMocks` does not reset a vi.fn() created inside a vi.mock factory.
    vi.clearAllMocks();
    vi.mocked(trainerConnectionService.getClients).mockResolvedValue([
      connection('client-a', 'Dana'),
      connection('client-b', 'Noa'),
      connection('client-c', 'Pending Pat', 'pending'),
    ]);
  });

  it('offers accepted clients only — a pending invite is not yet a client', async () => {
    render(<AssignPlanBody active onClose={() => {}} templateId="template-1" />);

    // The placeholder, not the label: MultiSelect puts the label on both the
    // search box and the hidden value input, so the label matches twice.
    const picker = await screen.findByPlaceholderText(
      'planLibrary.pickClientsPlaceholder',
    );
    fireEvent.click(picker);

    await waitFor(() =>
      expect(screen.getByText(/Dana/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/Noa/)).toBeInTheDocument();
    expect(screen.queryByText(/Pending Pat/)).not.toBeInTheDocument();
  });

  /**
   * The reason the modal stays open: a partial result is the answer, and
   * closing on "success" would throw away the only place it exists.
   */
  it('shows one row per client, with the reason each was skipped', async () => {
    vi.mocked(trainingPlanService.assignToClients).mockResolvedValue([
      { clientId: 'client-a', status: 'created', planId: 'plan-1' },
      {
        clientId: 'client-b',
        status: 'skipped',
        reason: 'already_assigned',
      },
    ]);

    render(<AssignPlanBody active onClose={() => {}} templateId="template-1" />);

    const picker = await screen.findByPlaceholderText(
      'planLibrary.pickClientsPlaceholder',
    );
    fireEvent.click(picker);
    fireEvent.click(await screen.findByText(/Dana/));

    fireEvent.click(screen.getByText('planLibrary.assign'));

    await waitFor(() =>
      expect(
        screen.getByText('planLibrary.status.created'),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText('planLibrary.reason.already_assigned'),
    ).toBeInTheDocument();
    // Counted honestly: one of two, not "done".
    expect(
      screen.getByText(/planLibrary.assignSummary:.*"created":1.*"total":2/),
    ).toBeInTheDocument();
  });

  it('will not submit with nobody selected', async () => {
    render(<AssignPlanBody active onClose={() => {}} templateId="template-1" />);

    const assign = (await screen.findByText('planLibrary.assign')).closest(
      'button',
    )!;
    expect(assign).toBeDisabled();
    expect(trainingPlanService.assignToClients).not.toHaveBeenCalled();
  });
});

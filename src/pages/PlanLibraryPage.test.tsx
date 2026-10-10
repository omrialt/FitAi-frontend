import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import PlanLibraryPage from './PlanLibraryPage';
import { trainingPlanService } from '../services/training-plan.service';

/**
 * N-33: the save-as-template picker opened empty with no word of explanation,
 * which is exactly what a new trainer meets on day one.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'he' },
  }),
}));

vi.mock('../components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/trainer/AssignPlanModal', () => ({
  AssignPlanModal: () => null,
}));

vi.mock('../services/training-plan.service', () => ({
  trainingPlanService: {
    getLibrary: vi.fn(),
    getByUserWithShared: vi.fn(),
    saveAsTemplate: vi.fn(),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({ user: { _id: 'trainer-1' } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const service = trainingPlanService as unknown as {
  getLibrary: ReturnType<typeof vi.fn>;
  getByUserWithShared: ReturnType<typeof vi.fn>;
};

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <PlanLibraryPage />
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('PlanLibraryPage — save as template', () => {
  beforeEach(() => {
    service.getLibrary.mockResolvedValue([]);
  });

  it('explains an empty picker and points at creating a plan', async () => {
    service.getByUserWithShared.mockResolvedValue([]);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'planLibrary.saveAsTemplate' }));

    expect(await screen.findByText('planLibrary.noOwnPlans')).toBeInTheDocument();
    expect(screen.getByText('planLibrary.noOwnPlansHint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'planLibrary.createPlan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.save' })).toBeDisabled();
  });

  /**
   * The demo trainer's only plan belonged to their client — offered by the
   * listing, refused by save-as-template. Not offering it is the fix.
   */
  it("treats plans owned by someone else as none of the trainer's own", async () => {
    service.getByUserWithShared.mockResolvedValue([
      { _id: 'p1', title: 'Client Upper/Lower', userId: { _id: 'client-1', fullName: 'C', email: 'c@x' } },
    ]);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'planLibrary.saveAsTemplate' }));

    expect(await screen.findByText('planLibrary.noOwnPlans')).toBeInTheDocument();
  });

  it('offers the picker when the trainer has a plan of their own', async () => {
    service.getByUserWithShared.mockResolvedValue([
      { _id: 'p2', title: 'My PPL', userId: 'trainer-1' },
    ]);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'planLibrary.saveAsTemplate' }));

    expect(await screen.findByText('planLibrary.pickPlan')).toBeInTheDocument();
    expect(screen.queryByText('planLibrary.noOwnPlans')).toBeNull();
  });
});

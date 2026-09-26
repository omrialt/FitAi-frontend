import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';

import { MobileBottomNav, type QuickAction } from './MobileBottomNav';
import type { NavItem } from '../types/layout.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const items: NavItem[] = [
  { icon: null, label: 'Dashboard', path: '/', primary: true },
  { icon: null, label: 'Trainings', path: '/my-trainings', primary: true },
  { icon: null, label: 'Nutrition', path: '/nutrition-plans', primary: true },
  { icon: null, label: 'Physical', path: '/physical-data', primary: true },
  { icon: null, label: 'Schedule', path: '/schedule' },
];

const quickActions: QuickAction[] = [
  { icon: null, label: 'Log meal', path: '/log-meal' },
  { icon: null, label: 'Start workout', path: '/my-trainings' },
];

function renderNav(props: Partial<React.ComponentProps<typeof MobileBottomNav>> = {}) {
  const onNavigate = vi.fn();
  render(
    <MantineProvider>
      <MobileBottomNav
        items={items}
        currentPath="/"
        onNavigate={onNavigate}
        colorScheme="light"
        onToggleColorScheme={() => {}}
        language="en"
        onChangeLanguage={() => {}}
        onLogout={() => {}}
        {...props}
      />
    </MantineProvider>,
  );
  return { onNavigate };
}

describe('MobileBottomNav', () => {
  it('shows four destinations plus More without a FAB', () => {
    renderNav();
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('.bottom-tab')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: 'nav.quickAdd' })).toBeNull();
  });

  it('gives the FAB a slot, keeping the bar at five', () => {
    renderNav({ quickActions });
    const nav = screen.getByRole('navigation');
    // 3 destinations + More, plus the FAB slot
    expect(nav.querySelectorAll('.bottom-tab')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'nav.quickAdd' })).toBeInTheDocument();
    // The fourth primary item overflowed into More instead of disappearing
    expect(screen.queryByText('Physical')).toBeNull();
  });

  it('marks the tab that owns a detail route as current', () => {
    renderNav({
      currentPath: '/training-plans/abc',
      isActive: (path) => path === '/my-trainings',
    });
    expect(screen.getByText('Trainings').closest('button')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Dashboard').closest('button')).not.toHaveAttribute('aria-current');
  });

  it('opens the quick-add sheet and navigates from it', async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderNav({ quickActions });
    await user.click(screen.getByRole('button', { name: 'nav.quickAdd' }));
    await user.click(await screen.findByText('Log meal'));
    expect(onNavigate).toHaveBeenCalledWith('/log-meal');
  });

  it('lights More when the current page lives in the overflow', () => {
    renderNav({ currentPath: '/schedule' });
    expect(screen.getByText('nav.more').closest('button')).toHaveAttribute('aria-current', 'page');
  });
});

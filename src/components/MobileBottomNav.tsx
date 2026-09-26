/**
 * MobileBottomNav - Fixed bottom navigation bar for mobile viewports
 *
 * At most five slots (ui-ux-pro-max `bottom-nav-limit`): four destinations
 * plus More, or — for athletes — three destinations, a centre quick-add FAB and
 * More. The FAB opens a sheet of the logging actions an athlete reaches for
 * mid-day (start a workout, log a meal, log a measurement). The bar
 * used to render `items.slice(0, 5)`, which silently truncated the nav: a
 * signed-in user's sixth item is Schedule, so Schedule had no mobile entry
 * point at all. Overflow now lands in the More sheet instead of falling off
 * the end, and the bar clears the home indicator via safe-area insets.
 */

import { useState } from 'react';
import { Box, Divider, Drawer, SegmentedControl, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconDots, IconLogout, IconMoon, IconPlus, IconSun, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { NavItem } from '../types/layout.types';

export interface QuickAction {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
  currentPath: string;
  /** Prefix-aware match, so a detail screen still lights up its list's tab. */
  isActive?: (path: string) => boolean;
  onNavigate: (path: string) => void;
  /** When present, a centre FAB opens these as a sheet. */
  quickActions?: QuickAction[];
  /**
   * Account actions the sheet owns on mobile. The design puts the theme and
   * language toggles here rather than in the top app bar, which is capped at
   * "back/logo + title + at most two actions".
   */
  colorScheme: string;
  onToggleColorScheme: () => void;
  language: 'en' | 'he';
  onChangeLanguage: (lng: string) => void;
  onLogout: () => void;
}

/**
 * One tab. The nav's own floor is 56px, above the app-wide 44px minimum.
 * Active is carried by colour, weight *and* a pill behind the icon, so it
 * does not depend on colour alone.
 */
function Tab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="bottom-tab"
      data-active={active || undefined}
    >
      <span className="bottom-tab__icon" aria-hidden="true">{icon}</span>
      <span className="bottom-tab__label">{label}</span>
    </UnstyledButton>
  );
}

/**
 * One row inside the More sheet.
 *
 * `paddingInline` is logical and matches the sheet header's spacing so the
 * icons line up under the title. `textAlign: start` matters because a <button>
 * resets text-align to `center` in every browser, and that does not follow the
 * document direction — the labels centred themselves instead of hanging off the
 * start edge in RTL.
 */
const rowStyle = (active: boolean): React.CSSProperties => ({
  minHeight: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 12,
  paddingInline: 'var(--mantine-spacing-md)',
  paddingBlock: 0,
  textAlign: 'start',
  borderRadius: 'var(--radius-control)',
  color: active ? 'var(--color-primary)' : 'var(--color-on-surface)',
  background: active
    ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
    : undefined,
});

export function MobileBottomNav({
  items,
  currentPath,
  isActive,
  onNavigate,
  quickActions,
  colorScheme,
  onToggleColorScheme,
  language,
  onChangeLanguage,
  onLogout,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const active = (path: string) => (isActive ? isActive(path) : currentPath === path);

  // The FAB takes one of the five slots, so athletes get three destinations.
  const slots = quickActions?.length ? 3 : 4;
  const primary = items.filter((i) => i.primary).slice(0, slots);
  // Anything not on the bar — plus any primary item that did not fit — stays
  // reachable rather than disappearing.
  const overflow = items.filter((i) => !primary.includes(i));

  const go = (path: string) => {
    setMoreOpen(false);
    setQuickOpen(false);
    onNavigate(path);
  };

  const tabs = primary.map((item) => (
    <Tab
      key={item.path}
      icon={item.icon}
      label={item.label}
      active={active(item.path)}
      onClick={() => go(item.path)}
    />
  ));

  if (quickActions?.length) {
    tabs.splice(
      2,
      0,
      <div key="__fab" className="bottom-fab-slot">
        <UnstyledButton
          className="bottom-fab"
          onClick={() => setQuickOpen(true)}
          aria-label={t('nav.quickAdd')}
          aria-haspopup="dialog"
          aria-expanded={quickOpen}
        >
          <IconPlus size={26} stroke={2.25} />
        </UnstyledButton>
      </div>,
    );
  }

  return (
    <>
      <nav className="bottom-nav" aria-label={t('nav.primaryNav')}>
        {tabs}

        {overflow.length > 0 && (
          <Tab
            icon={<IconDots size={22} stroke={1.5} />}
            label={t('nav.more')}
            active={overflow.some((i) => active(i.path))}
            onClick={() => setMoreOpen(true)}
          />
        )}
      </nav>

      {quickActions?.length ? (
        <Drawer
          opened={quickOpen}
          onClose={() => setQuickOpen(false)}
          position="bottom"
          title={t('nav.quickAdd')}
          closeButtonProps={{ 'aria-label': t('common.close'), size: 'lg' }}
          styles={{
            content: {
              height: 'auto',
              maxHeight: '85vh',
              borderStartStartRadius: 'var(--radius-sheet)',
              borderStartEndRadius: 'var(--radius-sheet)',
            },
            body: { paddingBottom: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-bottom, 0px))' },
          }}
        >
          <div className="quick-grid">
            {quickActions.map((a) => (
              <UnstyledButton key={a.label} className="quick-tile" onClick={() => go(a.path)}>
                <span className="quick-tile__icon" aria-hidden="true">{a.icon}</span>
                <span className="quick-tile__label">{a.label}</span>
              </UnstyledButton>
            ))}
          </div>
        </Drawer>
      ) : null}

      {/*
       * `size="auto"` is not a Mantine size token. It compiled to
       * `--drawer-size: var(--drawer-size-auto)`, an undefined variable, so the
       * height collapsed to the 100% default and the sheet covered the whole
       * screen — which is why it read as impossible to dismiss: it stopped
       * looking like a sheet, and the close control was nowhere near where a
       * sheet's would be. Sizing the content directly keeps it hugging its
       * items, with a cap so a long list still leaves scrim to tap.
       *
       * `withCloseButton` was also false, leaving the scrim as the only exit.
       * Both are fixed here; scrim and Escape remain as secondary dismissals.
       */}
      <Drawer
        opened={moreOpen}
        onClose={() => setMoreOpen(false)}
        position="bottom"
        withCloseButton
        closeOnClickOutside
        closeOnEscape
        closeButtonProps={{
          'aria-label': t('common.close'),
          size: 'lg',
        }}
        styles={{
          content: {
            height: 'auto',
            maxHeight: '85vh',
            borderStartStartRadius: 'var(--radius-sheet)',
            borderStartEndRadius: 'var(--radius-sheet)',
          },
        }}
        title={t('nav.more')}
      >
        <Stack gap={4} pb="md" style={{ marginInline: 'calc(var(--mantine-spacing-md) * -1)' }}>
          {overflow.map((item) => {
            const on = active(item.path);
            return (
              <UnstyledButton
                key={item.path}
                onClick={() => go(item.path)}
                aria-current={on ? 'page' : undefined}
                style={rowStyle(on)}
              >
                <Box lh={1} style={{ flex: '0 0 auto' }}>{item.icon}</Box>
                <Text size="sm" fw={on ? 700 : 500} style={{ flex: 1, textAlign: 'start' }}>
                  {item.label}
                </Text>
              </UnstyledButton>
            );
          })}

          <Divider my="xs" color="var(--color-outline-variant)" />

          <UnstyledButton onClick={() => go('/profile')} style={rowStyle(currentPath === '/profile')}>
            <Box lh={1} style={{ flex: '0 0 auto' }}><IconUser size={20} stroke={1.5} /></Box>
            <Text size="sm" fw={500} style={{ flex: 1, textAlign: 'start' }}>
              {t('layout.profile')}
            </Text>
          </UnstyledButton>

          <UnstyledButton onClick={onToggleColorScheme} style={rowStyle(false)}>
            <Box lh={1} style={{ flex: '0 0 auto' }}>
              {colorScheme === 'dark' ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
            </Box>
            <Text size="sm" fw={500} style={{ flex: 1, textAlign: 'start' }}>
              {colorScheme === 'dark' ? t('layout.switchToLight') : t('layout.switchToDark')}
            </Text>
          </UnstyledButton>

          <div style={{ ...rowStyle(false), cursor: 'default' }}>
            <Text size="sm" fw={500} style={{ flex: 1, textAlign: 'start' }}>
              {t('layout.language')}
            </Text>
            <SegmentedControl
              size="xs"
              value={language}
              onChange={onChangeLanguage}
              data={[
                { value: 'en', label: 'EN' },
                { value: 'he', label: 'עב' },
              ]}
              aria-label={t('layout.language')}
            />
          </div>

          <UnstyledButton
            onClick={() => { setMoreOpen(false); onLogout(); }}
            style={{ ...rowStyle(false), color: 'var(--color-danger)' }}
          >
            <Box lh={1} style={{ flex: '0 0 auto' }}><IconLogout size={20} stroke={1.5} /></Box>
            <Text size="sm" fw={600} style={{ flex: 1, textAlign: 'start' }}>
              {t('layout.logout')}
            </Text>
          </UnstyledButton>
        </Stack>
      </Drawer>
    </>
  );
}

/**
 * MobileBottomNav - Fixed bottom navigation bar for mobile viewports
 *
 * Four destinations plus More, per the athlete screens deliverable. The bar
 * used to render `items.slice(0, 5)`, which silently truncated the nav: a
 * signed-in user's sixth item is Schedule, so Schedule had no mobile entry
 * point at all. Overflow now lands in the More sheet instead of falling off
 * the end, and the bar clears the home indicator via safe-area insets.
 */

import { useState } from 'react';
import { Box, Divider, Drawer, Group, SegmentedControl, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconDots, IconLogout, IconMoon, IconSun, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { NavItem } from '../types/layout.types';

interface MobileBottomNavProps {
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
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

/** One tab. The nav's own floor is 50px, above the app-wide 44px minimum. */
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
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      style={{ flex: 1, minHeight: 50 }}
    >
      <Stack gap={2} align="center">
        <Box c={active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'} lh={1}>
          {icon}
        </Box>
        <Text
          size="10px"
          fw={active ? 700 : 500}
          c={active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'}
        >
          {label}
        </Text>
      </Stack>
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
  onNavigate,
  colorScheme,
  onToggleColorScheme,
  language,
  onChangeLanguage,
  onLogout,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = items.filter((i) => i.primary).slice(0, 4);
  // Anything not on the bar — plus any primary item that did not fit — stays
  // reachable rather than disappearing.
  const overflow = items.filter((i) => !primary.includes(i));

  const go = (path: string) => {
    setMoreOpen(false);
    onNavigate(path);
  };

  return (
    <>
      <Group
        justify="space-around"
        gap={0}
        h="100%"
        w="100%"
        wrap="nowrap"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {primary.map((item) => (
          <Tab
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={currentPath === item.path}
            onClick={() => go(item.path)}
          />
        ))}

        {overflow.length > 0 && (
          <Tab
            icon={<IconDots size={20} stroke={1.5} />}
            label={t('nav.more')}
            active={overflow.some((i) => i.path === currentPath)}
            onClick={() => setMoreOpen(true)}
          />
        )}
      </Group>

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
            const active = currentPath === item.path;
            return (
              <UnstyledButton
                key={item.path}
                onClick={() => go(item.path)}
                aria-current={active ? 'page' : undefined}
                style={rowStyle(active)}
              >
                <Box lh={1} style={{ flex: '0 0 auto' }}>{item.icon}</Box>
                <Text size="sm" fw={active ? 700 : 500} style={{ flex: 1, textAlign: 'start' }}>
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

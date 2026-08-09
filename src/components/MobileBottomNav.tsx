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
import { Box, Drawer, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { NavItem } from '../types/layout.types';

interface MobileBottomNavProps {
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

/** One tab. Sized to the design's 44px minimum touch target. */
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
      style={{ flex: 1, minHeight: 44 }}
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

export function MobileBottomNav({ items, currentPath, onNavigate }: MobileBottomNavProps) {
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
                style={{
                  minHeight: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 12,
                  // Logical, and matched to the header's inline spacing so the
                  // icons line up under the title rather than sitting 4px in
                  // from it.
                  paddingInline: 'var(--mantine-spacing-md)',
                  paddingBlock: 0,
                  // A <button> resets text-align to `center` in every browser,
                  // which does not follow the document direction — so the
                  // labels centred themselves instead of hanging off the start
                  // edge. `start` restores direction-awareness in both LTR and
                  // RTL without a physical value.
                  textAlign: 'start',
                  borderRadius: 'var(--radius-control)',
                  color: active ? 'var(--color-primary)' : 'var(--color-on-surface)',
                  background: active
                    ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                    : undefined,
                }}
              >
                <Box lh={1} style={{ flex: '0 0 auto' }}>{item.icon}</Box>
                <Text size="sm" fw={active ? 700 : 500} style={{ flex: 1, textAlign: 'start' }}>
                  {item.label}
                </Text>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>
    </>
  );
}

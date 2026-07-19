/**
 * MobileBottomNav - Fixed bottom navigation bar for mobile viewports
 */

import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import type { NavItem } from '../types/layout.types';

interface MobileBottomNavProps {
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function MobileBottomNav({ items, currentPath, onNavigate }: MobileBottomNavProps) {
  return (
    <Group justify="space-around" gap={0} h="100%" w="100%" wrap="nowrap">
      {items.slice(0, 5).map((item) => {
        const isActive = currentPath === item.path;
        return (
          <UnstyledButton
            key={item.path}
            onClick={() => onNavigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{ flex: 1 }}
          >
            <Stack gap={0} align="center">
              <Box c={isActive ? 'indigo' : 'dimmed'} lh={1}>
                {item.icon}
              </Box>
              <Text size="10px" c={isActive ? 'indigo' : 'dimmed'} fw={isActive ? 700 : 500}>
                {item.label}
              </Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}

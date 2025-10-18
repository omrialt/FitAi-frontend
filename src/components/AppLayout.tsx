import { useState } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Text,
  UnstyledButton,
  Avatar,
  useMantineColorScheme,
  ActionIcon,
  Tooltip,
  Stack,
  ScrollArea,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconBrain,
  IconSettings,
  IconSun,
  IconMoon,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import './AppLayout.css';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const navigationItems: NavItem[] = [
    {
      icon: <IconDashboard size={20} stroke={1.5} />,
      label: 'Dashboard',
      active: activeTab === 'Dashboard',
      onClick: () => {
        setActiveTab('Dashboard');
        close();
      },
    },
    {
      icon: <IconBrain size={20} stroke={1.5} />,
      label: 'AI Tools',
      active: activeTab === 'AI Tools',
      onClick: () => {
        setActiveTab('AI Tools');
        close();
      },
    },
    {
      icon: <IconSettings size={20} stroke={1.5} />,
      label: 'Settings',
      active: activeTab === 'Settings',
      onClick: () => {
        setActiveTab('Settings');
        close();
      },
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      footer={{ height: 50 }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text
              size="xl"
              fw={700}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
            >
              FitAI
            </Text>
          </Group>

          <Group gap="xs">
            <Tooltip label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}>
              <ActionIcon
                onClick={() => toggleColorScheme()}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
                className="theme-toggle"
              >
                {colorScheme === 'dark' ? (
                  <IconSun size={20} stroke={1.5} />
                ) : (
                  <IconMoon size={20} stroke={1.5} />
                )}
              </ActionIcon>
            </Tooltip>

            {/* User Menu with Radix Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <UnstyledButton className="user-button">
                  <Group gap="xs">
                    <Avatar color="indigo" radius="xl" size="md">
                      <IconUser size={18} />
                    </Avatar>
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={500}>
                        John Doe
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content className="dropdown-content" sideOffset={5}>
                  <DropdownMenu.Item className="dropdown-item">
                    <IconUser size={16} />
                    <span>Profile</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="dropdown-item">
                    <IconSettings size={16} />
                    <span>Settings</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="dropdown-separator" />
                  <DropdownMenu.Item className="dropdown-item dropdown-item-danger">
                    <IconLogout size={16} />
                    <span>Logout</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Arrow className="dropdown-arrow" />
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="xs">
            {navigationItems.map((item) => (
              <UnstyledButton
                key={item.label}
                className={`nav-item ${item.active ? 'nav-item-active' : ''}`}
                onClick={item.onClick}
              >
                <Group gap="sm">
                  {item.icon}
                  <Text size="sm" fw={500}>
                    {item.label}
                  </Text>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Box className="navbar-footer">
            <Text size="xs" c="dimmed" ta="center">
              v1.0.0
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <ScrollArea h="calc(100vh - 110px)">
          {children}
        </ScrollArea>
      </AppShell.Main>

      {/* Footer */}
      <AppShell.Footer p="md">
        <Group justify="center" h="100%">
          <Text size="sm" c="dimmed">
            © 2025 FitAI. All rights reserved.
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

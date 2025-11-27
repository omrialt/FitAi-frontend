// React 19: No forwardRef needed - refs work directly on components
import { useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Image,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconSun,
  IconMoon,
  IconLogout,
  IconUser,
  IconHome,
  IconLogin,
  IconUserPlus,
  IconBarbell,
  IconApple,
  IconChartLine,
  IconCalendar,
  IconUsers,
  IconNotebook,
  IconReport,
  IconDatabase,
  IconActivity,
  IconHeartRateMonitor,
  IconBrain,
  IconClipboardList,
} from '@tabler/icons-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/auth.types';
import '../styles/AppLayout.css'

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Get navigation items based on user authentication status and role
 */
const getNavigationItems = (isAuthenticated: boolean, role: UserRole | null): NavItem[] => {
  // Not logged in - public navigation
  if (!isAuthenticated || !role) {
    return [
      { icon: <IconHome size={20} stroke={1.5} />, label: 'Home', path: '/' },
      { icon: <IconLogin size={20} stroke={1.5} />, label: 'Login', path: '/login' },
      { icon: <IconUserPlus size={20} stroke={1.5} />, label: 'Register', path: '/register' },
    ];
  }

  // Logged-in user (athlete) - user navigation
  if (role === 'user') {
    return [
      { icon: <IconDashboard size={20} stroke={1.5} />, label: 'Dashboard', path: '/' },
      { icon: <IconBarbell  size={20} stroke={1.5} />, label: 'My Trainings', path: '/my-trainings' },
      { icon: <IconApple size={20} stroke={1.5} />, label: 'Nutrition Plans', path: '/nutrition-plans' },
      { icon: <IconActivity size={20} stroke={1.5} />, label: 'Performance', path: '/performance' },
      { icon: <IconChartLine size={20} stroke={1.5} />, label: 'Progress Stats', path: '/progress' },
      { icon: <IconHeartRateMonitor size={20} stroke={1.5} />, label: 'Physical Data', path: '/physical-data' },
      { icon: <IconClipboardList size={20} stroke={1.5} />, label: 'Current Status', path: '/status' },
      { icon: <IconBrain size={20} stroke={1.5} />, label: 'AI Recommendations', path: '/ai-recommendations' },
      { icon: <IconCalendar size={20} stroke={1.5} />, label: 'Schedule', path: '/schedule' },
    ];
  }

  // Logged-in trainer - trainer navigation
  if (role === 'trainer') {
    return [
      { icon: <IconDashboard size={20} stroke={1.5} />, label: 'Dashboard', path: '/' },
      { icon: <IconUsers size={20} stroke={1.5} />, label: 'Clients', path: '/clients' },
      { icon: <IconBarbell size={20} stroke={1.5} />, label: 'My Trainings', path: '/my-trainings' },
      { icon: <IconApple size={20} stroke={1.5} />, label: 'Nutrition Plans', path: '/nutrition-plans' },
      { icon: <IconNotebook size={20} stroke={1.5} />, label: 'Create Plan', path: '/create-plan' },
      { icon: <IconBrain size={20} stroke={1.5} />, label: 'AI Recommendations', path: '/ai-recommendations' },
      { icon: <IconChartLine size={20} stroke={1.5} />, label: 'Progress Analytics', path: '/analytics' },
    ];
  }

  // Admin - admin navigation
  if (role === 'admin') {
    return [
      { icon: <IconDashboard size={20} stroke={1.5} />, label: 'Dashboard', path: '/' },
      { icon: <IconUsers size={20} stroke={1.5} />, label: 'Users', path: '/users' },
      { icon: <IconBarbell size={20} stroke={1.5} />, label: 'Training Plans', path: '/my-trainings' },
      { icon: <IconApple size={20} stroke={1.5} />, label: 'Nutrition Plans', path: '/nutrition-plans' },
      { icon: <IconActivity size={20} stroke={1.5} />, label: 'Performance Data', path: '/performance' },
      { icon: <IconHeartRateMonitor size={20} stroke={1.5} />, label: 'Physical Data', path: '/physical-data' },
      { icon: <IconBrain size={20} stroke={1.5} />, label: 'AI Recommendations', path: '/ai-recommendations' },
      { icon: <IconReport size={20} stroke={1.5} />, label: 'Reports', path: '/reports' },
      { icon: <IconDatabase size={20} stroke={1.5} />, label: 'System', path: '/system' },
    ];
  }

  // Fallback to public navigation
  return [
    { icon: <IconHome size={20} stroke={1.5} />, label: 'Home', path: '/' },
  ];
};

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth state from Zustand store
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Get dynamic navigation items based on auth state
  const navigationItems = useMemo(
    () => getNavigationItems(isAuthenticated, user?.role || null),
    [isAuthenticated, user?.role]
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle navigation item click
  const handleNavClick = (path: string) => {
    navigate(path);
    close(); // Close mobile menu after navigation
  };

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
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            {/* FitAI Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Image
                src="/assets/fitai_logo_transparent.png"
                alt="FitAI Logo"
                h={40}
                w="auto"
                fit="contain"
                className="header-logo"
              />
            </Link>
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

            {/* Conditional User Menu - only show when authenticated */}
            {isAuthenticated && user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <UnstyledButton className="user-button">
                    <Group gap="xs">
                      <Avatar color="indigo" radius="xl" size="md" src={user.avatarUrl}>
                        {!user.avatarUrl && <IconUser size={18} />}
                      </Avatar>
                      <Box visibleFrom="sm">
                        <Text size="sm" fw={500}>
                          {user.fullName}
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="dropdown-content" sideOffset={5}>
                    <DropdownMenu.Item className="dropdown-item" onClick={() => navigate('/profile')}>
                      <IconUser size={16} />
                      <span>Profile</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="dropdown-separator" />
                    <DropdownMenu.Item className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                      <IconLogout size={16} />
                      <span>Logout</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow className="dropdown-arrow" />
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Group gap="xs">
                <UnstyledButton className="header-link" onClick={() => navigate('/login')}>
                  <Text size="sm" fw={500}>Login</Text>
                </UnstyledButton>
                <ActionIcon
                  variant="filled"
                  color="indigo"
                  size="lg"
                  onClick={() => navigate('/register')}
                  aria-label="Register"
                >
                  <IconUserPlus size={18} />
                </ActionIcon>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="xs">
            {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <UnstyledButton
                    key={item.label}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    <Group gap="sm">
                      {item.icon}
                      <Text size="sm" fw={500}>
                        {item.label}
                      </Text>
                    </Group>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </AppShell.Section>

          <AppShell.Section>
            <Box className="navbar-footer">
              {isAuthenticated && user && (
                <Text size="xs" c="dimmed" ta="center" mb="xs">
                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              )}
              <Text size="xs" c="dimmed" ta="center">
                v1.0.0
              </Text>
            </Box>
          </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        {children}
      </AppShell.Main>

      {/* Footer */}
      <AppShell.Footer p="md" style={{ position: 'relative' }}>
        <Group justify="center" h="100%">
          <Text size="sm" c="dimmed">
            © 2025 FitAI. All rights reserved.
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

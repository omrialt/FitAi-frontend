// React 19: No forwardRef needed - refs work directly on components
import { useMemo, Activity } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  IconCalendar,
  IconUsers,
  IconHeartRateMonitor,
} from "@tabler/icons-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@mantine/core";
import { useAuthStore } from "../store/authStore";
import { MobileBottomNav } from "./MobileBottomNav";
import type { UserRole } from "../types/auth.types";
import type { NavItem, AppLayoutProps } from '../types/layout.types';
import "../styles/AppLayout.css";

/**
 * Get navigation items based on user authentication status and role
 */
const getNavigationItems = (
  isAuthenticated: boolean,
  role: UserRole | null
): NavItem[] => {
  // Not logged in - public navigation
  if (!isAuthenticated || !role) {
    return [
      { icon: <IconHome size={20} stroke={1.5} />, label: "nav.home", path: "/" },
      {
        icon: <IconLogin size={20} stroke={1.5} />,
        label: "nav.login",
        path: "/login",
      },
      {
        icon: <IconUserPlus size={20} stroke={1.5} />,
        label: "nav.register",
        path: "/register",
      },
    ];
  }

  // Logged-in user (athlete) - user navigation
  if (role === "user") {
    return [
      {
        icon: <IconDashboard size={20} stroke={1.5} />,
        label: "nav.dashboard",
        path: "/",
      },
      {
        icon: <IconBarbell size={20} stroke={1.5} />,
        label: "nav.myTrainings",
        path: "/my-trainings",
      },
      {
        icon: <IconApple size={20} stroke={1.5} />,
        label: "nav.nutritionPlans",
        path: "/nutrition-plans",
      },
      {
        icon: <IconHeartRateMonitor size={20} stroke={1.5} />,
        label: "nav.physicalData",
        path: "/physical-data",
      },
      {
        icon: <IconCalendar size={20} stroke={1.5} />,
        label: "nav.schedule",
        path: "/schedule",
      },
    ];
  }

  // Logged-in trainer - trainer navigation
  if (role === "trainer") {
    return [
      {
        icon: <IconDashboard size={20} stroke={1.5} />,
        label: "nav.dashboard",
        path: "/",
      },
      {
        icon: <IconBarbell size={20} stroke={1.5} />,
        label: "nav.myTrainings",
        path: "/my-trainings",
      },
      {
        icon: <IconApple size={20} stroke={1.5} />,
        label: "nav.nutritionPlans",
        path: "/nutrition-plans",
      },
      {
        icon: <IconHeartRateMonitor size={20} stroke={1.5} />,
        label: "nav.physicalData",
        path: "/physical-data",
      },
      {
        icon: <IconCalendar size={20} stroke={1.5} />,
        label: "nav.schedule",
        path: "/schedule",
      },
    ];
  }

  // Admin - admin navigation
  if (role === "admin") {
    return [
      {
        icon: <IconDashboard size={20} stroke={1.5} />,
        label: "nav.dashboard",
        path: "/",
      },
      {
        icon: <IconUsers size={20} stroke={1.5} />,
        label: "nav.users",
        path: "/users",
      },
      {
        icon: <IconBarbell size={20} stroke={1.5} />,
        label: "nav.trainingPlans",
        path: "/my-trainings",
      },
      {
        icon: <IconApple size={20} stroke={1.5} />,
        label: "nav.nutritionPlans",
        path: "/nutrition-plans",
      },
      {
        icon: <IconHeartRateMonitor size={20} stroke={1.5} />,
        label: "nav.physicalData",
        path: "/physical-data",
      },
      {
        icon: <IconCalendar size={20} stroke={1.5} />,
        label: "nav.schedule",
        path: "/schedule",
      },
    ];
  }

  // Fallback to public navigation
  return [
    { icon: <IconHome size={20} stroke={1.5} />, label: "nav.home", path: "/" },
  ];
};

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Get auth state from Zustand store
  const { user, isAuthenticated, logout } = useAuthStore();

  // Get dynamic navigation items based on auth state (labels are i18n keys)
  const navigationItems = useMemo(
    () =>
      getNavigationItems(isAuthenticated, user?.role || null).map((item) => ({
        ...item,
        label: t(item.label),
      })),
    [isAuthenticated, user?.role, t]
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Handle navigation item click
  const handleNavClick = (path: string) => {
    navigate(path);
    close(); // Close mobile menu after navigation
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      footer={{ height: 48 }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header className="appshell-header">
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            {/* FitAI Logo */}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
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
            <SegmentedControl
              size="xs"
              value={i18n.language === "he" ? "he" : "en"}
              onChange={(lng) => i18n.changeLanguage(lng)}
              data={[
                { value: "en", label: "EN" },
                { value: "he", label: "עב" },
              ]}
              aria-label="Language"
            />
            <Tooltip
              label={
                colorScheme === "dark"
                  ? t("layout.switchToLight")
                  : t("layout.switchToDark")
              }
            >
              <ActionIcon
                onClick={() => toggleColorScheme()}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
                className="theme-toggle"
              >
                {colorScheme === "dark" ? (
                  <IconSun size={20} stroke={1.5} />
                ) : (
                  <IconMoon size={20} stroke={1.5} />
                )}
              </ActionIcon>
            </Tooltip>

            {/* Conditional User Menu - only show when authenticated */}
            <Activity mode={isAuthenticated && !!user ? "visible" : "hidden"}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <UnstyledButton className="user-button">
                    <Group gap="xs">
                      <Avatar
                        color="indigo"
                        radius="xl"
                        size="md"
                        src={user?.avatarUrl}
                      >
                        <Activity
                          mode={!user?.avatarUrl ? "visible" : "hidden"}
                        >
                          <IconUser size={18} />
                        </Activity>
                      </Avatar>
                      <Box visibleFrom="sm">
                        <Text size="sm" fw={500}>
                          {user?.fullName}
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="dropdown-content"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      <IconUser size={16} />
                      <span>{t("layout.profile")}</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="dropdown-separator" />
                    <DropdownMenu.Item
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <IconLogout size={16} />
                      <span>{t("layout.logout")}</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow className="dropdown-arrow" />
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </Activity>
            <Activity mode={!isAuthenticated || !user ? "visible" : "hidden"}>
              <Group gap="xs">
                <UnstyledButton
                  className="header-link"
                  onClick={() => navigate("/login")}
                >
                  <Text size="sm" fw={500}>
                    {t("nav.login")}
                  </Text>
                </UnstyledButton>
                <ActionIcon
                  variant="filled"
                  color="indigo"
                  size="lg"
                  onClick={() => navigate("/register")}
                  aria-label="Register"
                >
                  <IconUserPlus size={18} />
                </ActionIcon>
              </Group>
            </Activity>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppShell.Section grow component={ScrollArea} style={{ flex: 1 }}>
          <Stack gap="xs">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <UnstyledButton
                  key={item.label}
                  className={`nav-item ${isActive ? "nav-item-active" : ""}`}
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
            <Activity mode={isAuthenticated && !!user ? "visible" : "hidden"}>
              <Text size="xs" c="dimmed" ta="center" mb="xs">
                {t("layout.role")}: {user?.role.charAt(0).toUpperCase()}
                {user?.role.slice(1)}
              </Text>
            </Activity>
            <Text size="xs" c="dimmed" ta="center">
              v1.0.0
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>{children}</AppShell.Main>

      {/* Footer: bottom nav on mobile (when signed in), copyright on desktop */}
      <AppShell.Footer p="xs" style={{ position: "relative" }} className="appshell-footer">
        {isAuthenticated && user ? (
          <>
            <Box hiddenFrom="sm" h="100%">
              <MobileBottomNav
                items={navigationItems}
                currentPath={location.pathname}
                onNavigate={handleNavClick}
              />
            </Box>
            <Group justify="center" h="100%" visibleFrom="sm">
              <Text size="xs" c="dimmed">
                ֲ{t("layout.allRightsReserved")}
              </Text>
            </Group>
          </>
        ) : (
          <Group justify="center" h="100%">
            <Text size="xs" c="dimmed">
              ֲ{t("layout.allRightsReserved")}
            </Text>
          </Group>
        )}
      </AppShell.Footer>
    </AppShell>
  );
}

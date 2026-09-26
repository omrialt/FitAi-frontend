// React 19: No forwardRef needed - refs work directly on components
import { useMemo, useEffect, Activity } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppShell,
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
  Indicator,
  Badge,
  Button,
} from "@mantine/core";
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
  IconUsersGroup,
  IconActivityHeartbeat,
  IconMessage,
  IconTemplate,
  IconHeartRateMonitor,
  IconHistory,
  IconArrowLeft,
  IconToolsKitchen2,
  IconScale,
  IconPlayerPlay,
} from "@tabler/icons-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@mantine/core";
import { useAuthStore } from "../store/authStore";
import { useUnreadMessagesStore } from "../store/unreadMessagesStore";
import { usePendingInvitesStore } from "../store/pendingInvitesStore";
import { MobileBottomNav } from "./MobileBottomNav";
import { isNavActive } from "../utils/navMatch";
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
        primary: true,
        path: "/",
      },
      {
        icon: <IconBarbell size={20} stroke={1.5} />,
        label: "nav.myTrainings",
        primary: true,
        path: "/my-trainings",
      },
      {
        icon: <IconHistory size={20} stroke={1.5} />,
        label: "nav.workoutHistory",
        path: "/workout-history",
      },
      {
        icon: <IconMessage size={20} stroke={1.5} />,
        label: "nav.messages",
        path: "/messages",
      },
      {
        icon: <IconApple size={20} stroke={1.5} />,
        label: "nav.nutritionPlans",
        primary: true,
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
        primary: true,
        path: "/",
      },
      {
        icon: <IconUsersGroup size={20} stroke={1.5} />,
        label: "nav.myClients",
        primary: true,
        path: "/clients",
      },
      {
        icon: <IconActivityHeartbeat size={20} stroke={1.5} />,
        label: "nav.clientOverview",
        path: "/clients/overview",
      },
      {
        icon: <IconTemplate size={20} stroke={1.5} />,
        label: "nav.planLibrary",
        path: "/plan-library",
      },
      {
        icon: <IconBarbell size={20} stroke={1.5} />,
        label: "nav.myTrainings",
        primary: true,
        path: "/my-trainings",
      },
      {
        icon: <IconHistory size={20} stroke={1.5} />,
        label: "nav.workoutHistory",
        path: "/workout-history",
      },
      {
        icon: <IconMessage size={20} stroke={1.5} />,
        label: "nav.messages",
        path: "/messages",
      },
      {
        icon: <IconApple size={20} stroke={1.5} />,
        label: "nav.nutritionPlans",
        primary: true,
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
        primary: true,
        path: "/",
      },
      {
        icon: <IconUsers size={20} stroke={1.5} />,
        label: "nav.users",
        primary: true,
        path: "/users",
      },
      {
        icon: <IconUsersGroup size={20} stroke={1.5} />,
        label: "nav.myClients",
        primary: true,
        path: "/clients",
      },
      {
        icon: <IconActivityHeartbeat size={20} stroke={1.5} />,
        label: "nav.clientOverview",
        path: "/clients/overview",
      },
      {
        icon: <IconTemplate size={20} stroke={1.5} />,
        label: "nav.planLibrary",
        path: "/plan-library",
      },
      {
        icon: <IconMessage size={20} stroke={1.5} />,
        label: "nav.messages",
        path: "/messages",
      },
      {
        icon: <IconBarbell size={20} stroke={1.5} />,
        label: "nav.trainingPlans",
        primary: true,
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

/**
 * Screens a user drills into from a list. On phones these get a back button in
 * place of the logo, and a short title, because the bottom nav alone cannot
 * say "you are one level down".
 */
const DETAIL_ROUTES: Array<{ match: RegExp; title: string; parent: string }> = [
  { match: /^\/training-plans\/[^/]+/, title: "trainings.titleAdmin", parent: "/my-trainings" },
  { match: /^\/nutrition-plans\/[^/]+/, title: "nutrition.titleAdmin", parent: "/nutrition-plans" },
  // `/clients/overview` is its own nav destination, not a client.
  { match: /^\/clients\/(?!overview(?:\/|$))[^/]+/, title: "clients.pageTitle", parent: "/clients" },
  { match: /^\/workout\//, title: "nav.myTrainings", parent: "/my-trainings" },
  { match: /^\/log-meal/, title: "mealLog.title", parent: "/" },
  { match: /^\/profile/, title: "layout.profile", parent: "/" },
];

/** In-session workout owns the thumb zone; the global bottom nav steps aside. */
const FOCUS_ROUTES = [/^\/workout\//];

export function AppLayout({ children }: AppLayoutProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Get auth state from Zustand store
  const { user, isAuthenticated, logout } = useAuthStore();

  // Trainer invitations awaiting a response, surfaced as a badge on the avatar.
  // TrainerConnectionPanel keeps this in sync as invites are accepted/declined.
  const pendingInvites = usePendingInvitesStore((state) => state.count);
  const refreshPendingInvites = usePendingInvitesStore((state) => state.refresh);
  const clearPendingInvites = usePendingInvitesStore((state) => state.clear);

  // Unread messages, surfaced as a badge on the Messages nav row.
  const unreadMessages = useUnreadMessagesStore((state) => state.count);
  const refreshUnread = useUnreadMessagesStore((state) => state.refresh);
  const clearUnread = useUnreadMessagesStore((state) => state.clear);

  // Keyed on the user id, not the `user` object: an unrelated profile edit
  // (avatar, name) changes that object's identity and would otherwise refetch.
  const userId = user?._id;
  useEffect(() => {
    if (isAuthenticated && userId) {
      refreshPendingInvites();
      refreshUnread();
    } else {
      clearPendingInvites();
      clearUnread();
    }
  }, [
    isAuthenticated,
    userId,
    refreshPendingInvites,
    clearPendingInvites,
    refreshUnread,
    clearUnread,
  ]);

  // Get dynamic navigation items based on auth state (labels are i18n keys)
  const navigationItems = useMemo(
    () =>
      getNavigationItems(isAuthenticated, user?.role || null).map((item) => {
        const shortKey = item.label.replace(/^nav\./, "nav.short.");
        return {
          ...item,
          label: t(item.label),
          shortLabel: i18n.exists(shortKey) ? t(shortKey) : undefined,
          badge: item.path === "/messages" && unreadMessages > 0 ? unreadMessages : undefined,
        };
      }),
    [isAuthenticated, user?.role, t, i18n, unreadMessages]
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = (path: string) => navigate(path);

  const detail = DETAIL_ROUTES.find((r) => r.match.test(location.pathname));
  const isFocusRoute = FOCUS_ROUTES.some((r) => r.test(location.pathname));
  const signedIn = isAuthenticated && !!user;

  // react-router stamps a history index; 0 means this tab landed here directly
  // (a shared link, a refresh), where "back" would leave the app.
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(detail?.parent ?? "/");
  };

  // The athlete's bottom-bar FAB. Trainers and admins have no single "log"
  // action, so their bar is four destinations plus More.
  const quickActions =
    user?.role === "user"
      ? [
          { icon: <IconPlayerPlay size={20} stroke={1.5} />, label: t("nav.startWorkout"), path: "/my-trainings" },
          { icon: <IconToolsKitchen2 size={20} stroke={1.5} />, label: t("nav.logMeal"), path: "/log-meal" },
          { icon: <IconScale size={20} stroke={1.5} />, label: t("nav.logMeasurement"), path: "/physical-data" },
        ]
      : undefined;

  return (
    <AppShell
      header={{ height: { base: 56, md: 64 } }}
      // Phones navigate with the bottom bar only; the sidebar arrives at `md`,
      // where there is width to spare for it.
      navbar={{
        width: 240,
        breakpoint: "md",
        collapsed: { mobile: true },
      }}
      // Height grows by the safe-area inset rather than the bar padding itself:
      // AppShell sets a fixed border-box height, so padding there shrinks the
      // usable strip instead of clearing the home indicator.
      footer={{
        height: {
          // Guests have no bottom nav, and a copyright strip is not worth 40px
          // of a phone screen.
          base: signedIn ? "calc(64px + env(safe-area-inset-bottom, 0px))" : 0,
          md: 40,
        },
        collapsed: isFocusRoute,
      }}
      // Responsive gutter, kept equal to --page-gutter in theme.css. Set here
      // rather than in CSS: Mantine folds the navbar offset into the same
      // padding, and overriding it in CSS slid the content under the sidebar.
      padding={{ base: 16, sm: 24, lg: 32 }}
    >
      {/* Header */}
      <AppShell.Header className="appshell-header">
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            {detail && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                hiddenFrom="md"
                onClick={goBack}
                aria-label={t("common.back")}
                className="header-back"
              >
                <IconArrowLeft size={22} stroke={1.75} />
              </ActionIcon>
            )}
            <Link
              to="/"
              className={`header-brand ${detail ? "header-brand--detail" : ""}`}
            >
              <Image
                src="/assets/fitai_logo_transparent.png"
                alt={t("layout.logoAlt")}
                h={36}
                w="auto"
                fit="contain"
                className="header-logo"
              />
            </Link>
            {detail && (
              <Text className="header-title" hiddenFrom="md" fw={700} truncate>
                {t(detail.title)}
              </Text>
            )}
          </Group>

          <Group gap="xs" wrap="nowrap">
            <SegmentedControl
              size="xs"
              visibleFrom="sm"
              value={i18n.language === "he" ? "he" : "en"}
              onChange={(lng) => i18n.changeLanguage(lng)}
              data={[
                { value: "en", label: "EN" },
                { value: "he", label: "עב" },
              ]}
              aria-label={t("layout.language")}
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
                visibleFrom="sm"
                aria-label={t("layout.toggleColorScheme")}
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
                      <Indicator
                        color="red"
                        size={18}
                        offset={4}
                        disabled={pendingInvites === 0}
                        label={pendingInvites > 9 ? "9+" : pendingInvites}
                        aria-label={t("layout.pendingInvites", {
                          count: pendingInvites,
                        })}
                      >
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
                      </Indicator>
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
                      {pendingInvites > 0 && (
                        <Badge color="red" size="sm" circle ml="auto">
                          {pendingInvites}
                        </Badge>
                      )}
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
              {/* Guests have no bottom nav, so sign-in stays in the header at
                  every width. */}
              <Group gap="xs" wrap="nowrap">
                <UnstyledButton
                  className="header-link"
                  onClick={() => navigate("/login")}
                >
                  <Text size="sm" fw={500}>
                    {t("nav.login")}
                  </Text>
                </UnstyledButton>
                <Button
                  size="compact-md"
                  color="indigo"
                  onClick={() => navigate("/register")}
                  leftSection={<IconUserPlus size={16} />}
                >
                  {t("nav.register")}
                </Button>
              </Group>
            </Activity>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md" style={{ display: 'flex', flexDirection: 'column' }}>
        <AppShell.Section grow component={ScrollArea} style={{ flex: 1 }}>
          <Stack gap="xs">
            {navigationItems.map((item) => {
              const isActive = isNavActive(item.path, location.pathname);
              return (
                <UnstyledButton
                  key={item.label}
                  className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                  onClick={() => handleNavClick(item.path)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Group gap="sm">
                    {item.icon}
                    <Text size="sm" fw={500}>
                      {item.label}
                    </Text>
                    {item.badge ? (
                      <Badge size="sm" color="indigo" circle>
                        {item.badge}
                      </Badge>
                    ) : null}
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

      {/* Footer: bottom nav on phones (when signed in), copyright from `md` */}
      <AppShell.Footer className="appshell-footer">
        {signedIn && (
          <Box hiddenFrom="md" h="100%">
            <MobileBottomNav
              items={navigationItems}
              currentPath={location.pathname}
              isActive={(path) => isNavActive(path, location.pathname)}
              onNavigate={handleNavClick}
              quickActions={quickActions}
              colorScheme={colorScheme}
              onToggleColorScheme={toggleColorScheme}
              language={i18n.language === "he" ? "he" : "en"}
              onChangeLanguage={(lng) => i18n.changeLanguage(lng)}
              onLogout={handleLogout}
            />
          </Box>
        )}
        <Group justify="center" h="100%" visibleFrom="md">
          <Text size="xs" c="dimmed">
            {t("layout.allRightsReserved")}
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

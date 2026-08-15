/**
 * StitchIcon — bridges the Stitch designs' icon set to this project's.
 *
 * The exports in /stitch_fitai render icons as Material Symbols:
 *     <span class="material-symbols-outlined" data-icon="fitness_center">…</span>
 *
 * This app uses @tabler/icons-react everywhere else (63+ files), so rather than
 * pulling in a second icon system and a variable-font payload, each Material
 * Symbol name maps to its closest Tabler equivalent here. Translating a screen
 * then becomes mechanical:
 *     <StitchIcon name="fitness_center" size={20} />
 *
 * Keeping the map in one place means a swap only has to be corrected once,
 * however many screens reference it.
 */

import {
  IconActivity,
  IconAdjustmentsBolt,
  IconAlertTriangle,
  IconApple,
  IconArrowRight,
  IconBarbell,
  IconBell,
  IconBolt,
  IconBrain,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarStats,
  IconCalendarWeek,
  IconCheck,
  IconCircleCheck,
  IconCirclePlus,
  IconChartHistogram,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCloudCheck,
  IconDeviceWatch,
  IconDownload,
  IconDroplet,
  IconEdit,
  IconEye,
  IconGauge,
  IconGripVertical,
  IconHeartRateMonitor,
  IconHelp,
  IconHistory,
  IconInfoCircle,
  IconLayoutDashboard,
  IconLock,
  IconMail,
  IconMenu2,
  IconMoon,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconReportAnalytics,
  IconRosetteDiscountCheck,
  IconScale,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconSparkles,
  IconTarget,
  IconToolsKitchen2,
  IconTrash,
  IconTrendingDown,
  IconTrendingUp,
  IconUser,
  IconUserPlus,
  IconUsers,
  IconX,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

/** Material Symbol name -> Tabler component. */
const ICONS = {
  add: IconPlus,
  add_circle: IconCirclePlus,
  admin_panel_settings: IconShieldCheck,
  apple: IconApple,
  arrow_forward: IconArrowRight,
  balance: IconScale,
  bedtime: IconMoon,
  bolt: IconBolt,
  brain: IconBrain,
  calendar_month: IconCalendar,
  calendar_today: IconCalendarEvent,
  calendar_view_week: IconCalendarWeek,
  check: IconCheck,
  check_circle: IconCircleCheck,
  chevron_left: IconChevronLeft,
  chevron_right: IconChevronRight,
  close: IconX,
  cloud_done: IconCloudCheck,
  dashboard: IconLayoutDashboard,
  delete: IconTrash,
  download: IconDownload,
  drag_indicator: IconGripVertical,
  edit: IconEdit,
  edit_calendar: IconCalendarStats,
  electric_bolt: IconBolt,
  event: IconCalendarEvent,
  event_available: IconCalendarEvent,
  exercise: IconBarbell,
  expand_less: IconChevronUp,
  expand_more: IconChevronDown,
  fitness_center: IconBarbell,
  groups: IconUsers,
  help: IconHelp,
  history: IconHistory,
  info: IconInfoCircle,
  insights: IconChartHistogram,
  lightbulb: IconSparkles,
  lock: IconLock,
  mail: IconMail,
  menu: IconMenu2,
  monitor_weight: IconScale,
  monitoring: IconActivity,
  notifications: IconBell,
  person: IconUser,
  person_add: IconUserPlus,
  play_arrow: IconPlayerPlay,
  psychology: IconBrain,
  query_stats: IconReportAnalytics,
  rebase: IconAdjustmentsBolt,
  report: IconReportAnalytics,
  restaurant: IconToolsKitchen2,
  restaurant_menu: IconToolsKitchen2,
  scale: IconScale,
  search: IconSearch,
  settings: IconSettings,
  speed: IconGauge,
  sync: IconRefresh,
  timer: IconDeviceWatch,
  tips_and_updates: IconSparkles,
  track_changes: IconTarget,
  trending_down: IconTrendingDown,
  trending_flat: IconActivity,
  trending_up: IconTrendingUp,
  verified: IconRosetteDiscountCheck,
  verified_user: IconShieldCheck,
  visibility: IconEye,
  warning: IconAlertTriangle,
  water_drop: IconDroplet,
  heart_rate: IconHeartRateMonitor,
} satisfies Record<string, ComponentType<IconProps>>;

export type StitchIconName = keyof typeof ICONS;

interface StitchIconProps extends IconProps {
  name: StitchIconName;
}

export function StitchIcon({ name, size = 20, stroke = 2, ...rest }: StitchIconProps) {
  const Icon = ICONS[name];
  return <Icon size={size} stroke={stroke} {...rest} />;
}

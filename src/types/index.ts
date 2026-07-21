/**
 * Central export point for all type definitions
 * 
 * Import types from here for convenience:
 * import type { User, UploadedFile, UsePaginationOptions } from '@/types';
 */

// Auth types
export type {
  User,
  AuthTokens,
  UserRole,
} from './auth.types';

// API types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
} from './api.types';

// Upload types
export type {
  UploadProgress,
  UploadedFile,
  UploadError,
  UploadStatus,
  UseUploadOptions,
  UseUploadReturn,
} from './upload.types';

// Form types
export type {
  UseFormHandlerOptions,
  UseFormHandlerReturn,
  AxiosErrorResponse,
} from './form.types';

// Pagination types
export type {
  UsePaginationOptions,
  UsePaginationReturn,
  PaginationState,
} from './pagination.types';

// Storage types
export type {
  SetValue,
  StorageOptions,
} from './storage.types';

// Role/Permission types
export type {
  UseRoleGuardOptions,
  UseRoleGuardReturn,
  BasicUser,
} from './role.types';

// User types
export type {
  UpdateProfileDto,
  CreateUserDto,
  UserResponse,
} from './user.types';

// Dashboard types
export type {
  ProgressStats,
  AiRecommendation,
  DashboardData,
} from './dashboard.types';

// Store types
export type {
  AuthStore,
  UIStore,
} from './store.types';

// Export hook types
export type {
  UseExportOptions,
  UseExportReturn,
  UseNutritionExportOptions,
  UseNutritionExportReturn,
} from './export.types';

// Metadata types
export type { MetadataOptions } from './metadata.types';

// API hook types
export type {
  UseApiOptions,
  UseApiReturn,
  UseApiMutationReturn,
} from './api.types';

// Auth hook types
export type { UseAuthReturn } from './auth.types';

// Physical data range types
export type {
  RangeSegment,
  BMIRanges,
  WeightRanges,
  BodyFatRanges,
} from './physical-data.types';

// Layout component prop types
export type {
  NavItem,
  AppLayoutProps,
  ProtectedRouteProps,
  PublicRouteProps,
} from './layout.types';

// Admin component prop types
export type {
  AdminUsersActionsMenuProps,
  AdminUsersCardProps,
  AdminUsersCardListProps,
  AdminUsersFiltersProps,
  AdminUsersTableProps,
  AdminUserViewModalProps,
} from './admin.types';

// Calendar component prop types
export type {
  TrainingDayModalProps,
  WeeklyCalendarProps,
} from './calendar-components.types';

// Common component prop types
export type {
  BreadcrumbItem,
  AppBreadcrumbsProps,
  PaginationControlsProps,
  PlanType,
  BasePlanData,
  NutritionPlanData,
  TrainingPlanData,
  PlanHeaderProps,
  SharedObjectType,
  SharedAccessSectionProps,
  SharedWithEntry,
  SharedWithSectionProps,
  StarRatingProps,
} from './common.types';

// Dashboard component prop types
export type {
  ActiveNutritionCardProps,
  ActiveTrainingCardProps,
  BodyProgressCardProps,
  NutritionOverviewProps,
  QuickStatsCardsProps,
  RecentRecommendationsProps,
  TrainingOverviewProps,
  WelcomeSectionProps,
} from './dashboard-components.types';

// Nutrition component prop types
export type {
  DeleteNutritionModalProps,
  EditNutritionModalProps,
  NutritionsActionsMenuProps,
  NutritionsCardProps,
  NutritionsCardListProps,
  NutritionsFiltersProps,
  NutritionsHeaderProps,
  NutritionsTableProps,
  AddRatingProps,
  EditNutritionPlanModalProps,
  MealSectionProps,
  RatingsSectionProps,
  FoodItemProps,
  MealCardProps,
  MealsSectionProps,
} from './nutrition-components.types';

// Training component prop types
export type {
  DeleteTrainingModalProps,
  EditTrainingModalProps,
  TrainingsActionsMenuProps,
  TrainingsCardProps,
  TrainingsCardListProps,
  TrainingsFiltersProps,
  TrainingsHeaderProps,
  TrainingsTableProps,
  DaysSectionProps,
  ExerciseCardProps,
  ChartDataPoint,
  SetHistoryChartProps,
  SetHistoryModalProps,
  VideoModalProps,
  BasicInfoSectionProps,
  ExerciseItemProps,
  ProgramDetailsSectionProps,
  TrainingDayItemProps,
  TrainingDaysSectionProps,
} from './trainings-components.types';

// Profile component prop types
export type {
  ProfileDetailsProps,
  ProfileFormProps,
} from './profile.types';

// Physical data component prop types
export type {
  PhysicalDataHeaderProps,
  LatestRecordCardProps,
  MetricInfoTooltipProps,
  NoRecordsMessageProps,
  RangeBarProps,
  MeasurementsChartProps,
  DeleteMeasurementModalProps,
  MeasurementModalProps,
  MeasurementsTableProps,
  TableImprovementCellProps,
} from './physical-data-components.types';


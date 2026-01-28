/**
 * Services Index
 * Central export for all API services
 */

export { apiClient } from './apiClient';
export type { ApiResponse, ApiError } from './apiClient';

export { tokenService } from './tokenService';
export type { TokenData } from './tokenService';

export { authService } from './authService';
export type {
  SignupRequest,
  LoginRequest,
  AuthTokens,
  UserProfile,
  UserRole,
  LoginResponseData,
  AuthError,
} from './authService';

export { adminService } from './adminService';
export type {
  AdminUser,
  PaginatedUsers,
  UserListParams,
} from './adminService';

export { rbacService } from './rbacService';
export type {
  Permission,
  Role,
  CreatePermissionRequest,
  CreateRoleRequest,
} from './rbacService';

export { healthService } from './healthService';
export type { HealthStatus } from './healthService';

export { marketplaceService } from './marketplaceService';
export type {
  MarketplaceItem,
  MarketplaceListParams,
  PaginatedItems,
} from './marketplaceService';

export { noticesService } from './noticesService';
export type {
  Notice,
  NoticesListParams,
  PaginatedNotices,
} from './noticesService';

export { feedbackService } from './feedbackService';
export type {
  Feedback,
  FeedbackListParams,
  PaginatedFeedback,
} from './feedbackService';

export type {
  UserProfile as UserProfileData,
  UpdateProfileRequest,
} from './userProfileService';

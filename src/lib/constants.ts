/**
 * Application-wide constants
 * Centralized for easy maintenance and consistency
 */

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  SHORT: 30 * 1000,         // 30 seconds
  MEDIUM: 5 * 60 * 1000,    // 5 minutes
  LONG: 30 * 60 * 1000,     // 30 minutes
  HOUR: 60 * 60 * 1000,     // 1 hour
} as const;

// API response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// Local storage keys (centralized to avoid typos)
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sv_access_token',
  REFRESH_TOKEN: 'sv_refresh_token',
  USER_DATA: 'sv_user_data',
  ADMIN_API_CONFIG: 'admin_api_config',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// User roles
export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  GRAMSEVAK: 'gramsevak',
  SUB_ADMIN: 'sub_admin',
  USER: 'user',
} as const;

// Approval statuses
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Item statuses
export const ITEM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SOLD: 'sold',
} as const;

// Common regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  AADHAR: /^\d{12}$/,
} as const;

// Debounce delays
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 150,
  RESIZE: 100,
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

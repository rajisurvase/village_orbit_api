/**
 * API Configuration for VillageOrbit Backend
 * This file centralizes all API configuration settings
 * The API base URL is configurable via environment variables or admin config
 */

// Default API configuration - Single source of truth for API host
const DEFAULT_API_BASE_URL = 'http://ec2-13-127-151-221.ap-south-1.compute.amazonaws.com:8001';
const API_VERSION = 'v1';

// Get API base URL from environment or use default
export const getApiBaseUrl = (): string => {
  // Check environment variable first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check localStorage for admin-configured URL (future-ready)
  if (typeof window !== 'undefined') {
    const adminConfig = localStorage.getItem('admin_api_config');
    if (adminConfig) {
      try {
        const config = JSON.parse(adminConfig);
        if (config.apiBaseUrl) {
          return config.apiBaseUrl;
        }
      } catch (e) {
        console.warn('Failed to parse admin API config:', e);
      }
    }
  }
  
  return DEFAULT_API_BASE_URL;
};

// Get village ID from localStorage or default
export const getDefaultVillageId = (): string => {
  if (typeof window !== 'undefined') {
    const villageId = localStorage.getItem('village_id');
    if (villageId) return villageId;
  }
  return 'shivankhed'; // Default village
};

// Set village ID in localStorage
export const setVillageId = (villageId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('village_id', villageId);
  }
};

// API Configuration object
export const apiConfig = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  
  get apiUrl() {
    return `${this.baseUrl}/api/${API_VERSION}`;
  },

  get villageId() {
    return getDefaultVillageId();
  },
  
  // Endpoints
  endpoints: {
    // Health
    health: '/health',
    
    // Auth endpoints
    auth: {
      signup: '/auth/signup',
      login: '/auth/login',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh-token',
      me: '/auth/me',
    },

    // User Profile endpoints
    profile: {
      get: '/users/profile',
      update: '/users/profile',
    },
    
    // Admin User Management endpoints
    admin: {
      users: '/admin/users',
      userById: (userId: string) => `/admin/users/${userId}`,
      approveUser: ({userId, villageId}) => `/admin/users/${userId}/approve?villageId=${villageId}`,
      rejectUser: (userId: string) => `/admin/users/${userId}/reject`,
    },
    
    // RBAC endpoints
    rbac: {
      permissions: '/rbac/permissions',
      permissionById: (permissionId: string) => `/rbac/permissions/${permissionId}`,
      roles: '/rbac/roles',
      roleById: (roleId: string) => `/rbac/roles/${roleId}`,
      rolePermissions: (roleId: string) => `/rbac/roles/${roleId}/permissions`,
      rolePermissionById: (roleId: string, permissionId: string) => 
        `/rbac/roles/${roleId}/permissions/${permissionId}`,
      userRoles: (userId: string) => `/rbac/users/${userId}/roles`,
      userRoleById: (userId: string, roleId: string) => 
        `/rbac/users/${userId}/roles/${roleId}`,
    },

    // Village endpoints
    villages: {
      list: '/villages',
      byId: (villageId: string) => `/villages/${villageId}`,
      config: (villageId: string) => `/villages/${villageId}/config`,
      create: '/villages',
      fileUpload : "/files/upload"
    },

    // Village Services endpoints
    services: {
      list: '/services',
      byId: (serviceId: string) => `/services/${serviceId}`,
      categories: '/services/categories',
      create: '/services',
      update: (serviceId: string) => `/services/${serviceId}`,
      delete: (serviceId: string) => `/services/${serviceId}`,
      rate: (serviceId: string) => `/services/${serviceId}/rating`,
    },

    // Marketplace/Items endpoints
    items: {
      list: '/items',
      byId: (itemId: string) => `/items/${itemId}`,
      create: '/items',
      update: (itemId: string) => `/items/${itemId}`,
      delete: (itemId: string) => `/items/${itemId}`,
      approve: (itemId: string) => `/items/${itemId}/approve`,
      reject: (itemId: string) => `/items/${itemId}/reject`,
      myItems: '/items/my-items',
    },

    // Forum/Posts endpoints
    posts: {
      list: '/posts',
      byId: (postId: string) => `/posts/${postId}`,
      create: '/posts',
      update: (postId: string) => `/posts/${postId}`,
      delete: (postId: string) => `/posts/${postId}`,
      like: (postId: string) => `/posts/${postId}/like`,
      comments: (postId: string) => `/posts/${postId}/comments`,
    },
    comments: {
      delete: (commentId: string) => `/comments/${commentId}`,
    },

    // Feedback & Contact endpoints
    feedback: {
      submit: '/feedback',
      list: '/admin/feedback',
    },
    contact: {
      submit: '/contact',
      list: '/admin/contact',
    },

    // Exams endpoints
    exams: {
      list: '/exams',
      byId: (examId: string) => `/exams/${examId}`,
      questions: (examId: string) => `/exams/${examId}/questions`,
      startAttempt: (examId: string) => `/exams/${examId}/attempts`,
      submitAttempt: (attemptId: string) => `/attempts/${attemptId}`,
      results: (attemptId: string) => `/attempts/${attemptId}/results`,
      importQuestions: (examId: string) => `/exams/${examId}/questions/import`,
    },

    // Push Notifications endpoints
    push: {
      subscribe: '/push/subscribe',
      unsubscribe: '/push/unsubscribe',
      adminSend: '/admin/push/send',
    },
    page_visibility: {  
      get: '/page-visibility'
    }
  },
};

// Helper to update admin API config (for future admin panel)
export const updateApiConfig = (config: { apiBaseUrl?: string }) => {
  if (typeof window !== 'undefined') {
    const existingConfig = localStorage.getItem('admin_api_config');
    const parsed = existingConfig ? JSON.parse(existingConfig) : {};
    const newConfig = { ...parsed, ...config };
    localStorage.setItem('admin_api_config', JSON.stringify(newConfig));
  }
};

// Helper to reset API config to default
export const resetApiConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_api_config');
  }
};

export default apiConfig;

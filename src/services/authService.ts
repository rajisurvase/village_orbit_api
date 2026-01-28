/**
 * Authentication Service
 * Handles all auth-related API calls based on VillageOrbit API Documentation
 */

import { apiClient, ApiResponse } from './apiClient';
import { tokenService } from './tokenService';
import { apiConfig, getDefaultVillageId } from '@/config/apiConfig';

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  mobile?: string;
  aadharNumber?: string;
  villageId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions?: Array<{ id: string; name: string }>;
}

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  mobile?: string;
  aadharNumber?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  villageId?: string;
  isActive: boolean;
  roles: UserRole[];
  allPermissions: string[];
  createdAt: string;
  approvedAt?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    userId: string;
    email: string;
    fullName: string;
    roles: UserRole[];
    permissions: string[];
  };
}

export interface AuthError {
  code?: string;
  message: string;
}

// API wrapper response format from VillageOrbit API
interface ApiWrapperResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

class AuthService {
  /**
   * Register a new user
   * On success, user must wait for admin approval
   */
  async signup(data: SignupRequest): Promise<ApiResponse<{ message: string; userId?: string }>> {
    const payload = {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      mobile: data.mobile,
      aadharNumber: data.aadharNumber,
      villageId: data.villageId || getDefaultVillageId(),
    };

    const response = await apiClient.post<ApiWrapperResponse<{ userId: string; email: string; approvalStatus: string }>>(
      apiConfig.endpoints.auth.signup,
      payload,
      false // No auth required for signup
    );

    if (response.success && response.data) {
      return {
        data: { message: response.data.message, userId: response.data.data?.userId },
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.data?.error?.message || response.error || 'Signup failed',
      status: response.status,
      success: false,
    };
  }

  /**
   * Login user with email and password
   * Stores tokens on success
   */
  async login(data: LoginRequest): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await apiClient.post<ApiWrapperResponse<LoginResponseData>>(
      apiConfig.endpoints.auth.login,
      data,
      false // No auth required for login
    );

    if (response.success && response.data?.data) {
      const loginData = response.data.data;
      
      // Store tokens (using camelCase from new API)
      tokenService.setTokens(loginData.accessToken, loginData.refreshToken);
      
      // Transform user data to UserProfile format
      const userProfile: UserProfile = {
        userId: loginData.user.userId,
        email: loginData.user.email,
        fullName: loginData.user.fullName,
        mobile: '',
        approvalStatus: 'APPROVED',
        isActive: true,
        roles: loginData.user.roles,
        allPermissions: loginData.user.permissions,
        createdAt: new Date().toISOString(),
      };
      
      // Store user data
      tokenService.setUserData(userProfile as any);

      return {
        data: { user: userProfile },
        status: response.status,
        success: true,
      };
    }

    // Check for error codes
    const errorCode = response.data?.error?.code;
    if (errorCode === 'USER_NOT_APPROVED' || errorCode === 'AUTH_FAILED') {
      return {
        error: response.data?.error?.message || 'Authentication failed',
        status: response.status || 401,
        success: false,
      };
    }

    return {
      error: response.data?.message || response.error || 'Login failed',
      status: response.status,
      success: false,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return {
        error: 'No refresh token available',
        status: 401,
        success: false,
      };
    }

    const response = await apiClient.post<ApiWrapperResponse<{ accessToken: string; expiresIn: number }>>(
      apiConfig.endpoints.auth.refreshToken,
      { refreshToken },
      false
    );

    if (response.success && response.data?.data) {
      const { accessToken, expiresIn } = response.data.data;
      tokenService.setAccessToken(accessToken);
      
      return {
        data: { accessToken, expiresIn },
        status: response.status,
        success: true,
      };
    }

    // Token refresh failed, clear tokens
    tokenService.clearTokens();
    
    return {
      error: response.data?.error?.message || 'Token refresh failed',
      status: response.status,
      success: false,
    };
  }

  /**
   * Logout user
   * Clears all tokens and user data
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(
          apiConfig.endpoints.auth.logout,
          { refreshToken },
          true
        );
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      tokenService.clearTokens();
    }
  }

  /**
   * Get current user profile
   * Returns null if not authenticated
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    // First check if we have tokens
    if (!tokenService.hasTokens()) {
      return {
        error: 'Not authenticated',
        status: 401,
        success: false,
      };
    }

    const response = await apiClient.get<ApiWrapperResponse<UserProfile>>(apiConfig.endpoints.auth.me);

    if (response.success && response.data?.data) {
      const userData = response.data.data;
      // Update stored user data
      tokenService.setUserData(userData as any);
      
      return {
        data: userData,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.data?.error?.message || response.error || 'Failed to fetch user profile',
      status: response.status,
      success: false,
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenService.hasTokens() && !tokenService.isTokenExpired();
  }

  /**
   * Get cached user data (without API call)
   */
  getCachedUser(): UserProfile | null {
    const userData = tokenService.getUserData();
    if (!userData) return null;
    
    // Transform snake_case to camelCase if needed
    return {
      userId: (userData as any).userId || (userData as any).user_id || (userData as any).id,
      email: userData.email,
      fullName: (userData as any).fullName || (userData as any).full_name,
      mobile: userData.mobile,
      aadharNumber: (userData as any).aadharNumber || (userData as any).aadhar_number,
      approvalStatus: ((userData as any).approvalStatus || (userData as any).approval_status || 'PENDING').toUpperCase(),
      villageId: (userData as any).villageId || (userData as any).village_id,
      isActive: (userData as any).isActive ?? (userData as any).is_active ?? true,
      roles: userData.roles || [],
      allPermissions: (userData as any).allPermissions || (userData as any).permissions || [],
      createdAt: (userData as any).createdAt || (userData as any).created_at,
    };
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCachedUser();
    if (!user?.roles) return false;
    return user.roles.some(r => 
      r.name.toLowerCase() === role.toLowerCase()
    );
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCachedUser();
    return user?.allPermissions?.includes(permission) || false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }

  /**
   * Check if user is approved
   */
  isApproved(): boolean {
    const user = this.getCachedUser();
    return user?.approvalStatus === 'APPROVED';
  }

  /**
   * Get role names from user
   */
  getRoleNames(): string[] {
    const user = this.getCachedUser();
    return user?.roles?.map(r => r.name) || [];
  }
}

export const authService = new AuthService();
export default authService;

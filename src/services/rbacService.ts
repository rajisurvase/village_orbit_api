/**
 * RBAC Service
 * Handles Role-Based Access Control API calls
 * Based on VillageOrbit API Documentation
 * Only accessible by SUPER_ADMIN users
 */

import { apiClient, ApiResponse } from './apiClient';
import { apiConfig } from '@/config/apiConfig';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  permissions: Array<{ id: string; name: string }>;
  createdAt?: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  isSystemRole?: boolean;
}

// API wrapper response format
interface ApiWrapperResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

class RbacService {
  // ============ PERMISSIONS ============

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await apiClient.get<ApiWrapperResponse<Permission[]>>(
      apiConfig.endpoints.rbac.permissions
    );
    
    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }
    
    return {
      error: response.data?.error?.message || response.error || 'Failed to fetch permissions',
      status: response.status,
      success: false,
    };
  }

  /**
   * Create a new permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<ApiResponse<Permission>> {
    const response = await apiClient.post<ApiWrapperResponse<Permission>>(
      apiConfig.endpoints.rbac.permissions,
      data
    );
    
    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }
    
    return {
      error: response.data?.error?.message || response.error || 'Failed to create permission',
      status: response.status,
      success: false,
    };
  }

  /**
   * Delete a permission
   */
  async deletePermission(permissionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<null>>(
      apiConfig.endpoints.rbac.permissionById(permissionId)
    );
    
    return {
      data: { message: response.data?.message || 'Permission deleted successfully' },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  // ============ ROLES ============

  /**
   * Get all roles
   */
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiClient.get<ApiWrapperResponse<Role[]>>(
      apiConfig.endpoints.rbac.roles
    );
    
    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }
    
    return {
      error: response.data?.error?.message || response.error || 'Failed to fetch roles',
      status: response.status,
      success: false,
    };
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    const response = await apiClient.post<ApiWrapperResponse<Role>>(
      apiConfig.endpoints.rbac.roles,
      data
    );
    
    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }
    
    return {
      error: response.data?.error?.message || response.error || 'Failed to create role',
      status: response.status,
      success: false,
    };
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<null>>(
      apiConfig.endpoints.rbac.roleById(roleId)
    );
    
    return {
      data: { message: response.data?.message || 'Role deleted successfully' },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  // ============ ROLE-PERMISSION MAPPING ============

  /**
   * Add permissions to a role
   * Accepts array of permission IDs
   */
  async addPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiWrapperResponse<null>>(
      apiConfig.endpoints.rbac.rolePermissions(roleId),
      permissionIds // Send as array directly per API spec
    );
    
    return {
      data: { message: response.data?.message || 'Permissions assigned to role successfully' },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  /**
   * Remove permission from a role
   */
  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<null>>(
      apiConfig.endpoints.rbac.rolePermissionById(roleId, permissionId)
    );
    
    return {
      data: { message: response.data?.message || 'Permission removed from role successfully' },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  // ============ USER-ROLE MAPPING ============

  /**
   * Assign roles to a user
   * Accepts array of role IDs
   */
  async assignRolesToUser(
    userId: string,
    roleIds: string[]
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiWrapperResponse<null>>(
      apiConfig.endpoints.rbac.userRoles(userId),
      roleIds // Send as array directly per API spec
    );
    
    return {
      data: { message: response.data?.message || 'Roles assigned to user successfully' },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  /**
   * Remove role from a user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<null>>(
      apiConfig.endpoints.rbac.userRoleById(userId, roleId)
    );
    
    return {
      data: { message: response.data?.message || 'Role removed from user successfully' },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }
}

export const rbacService = new RbacService();
export default rbacService;

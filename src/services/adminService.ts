/**
 * Admin Service
 * Handles admin-related API calls for user management
 * Based on VillageOrbit API Documentation
 */

import { apiClient, ApiResponse } from "./apiClient";
import { apiConfig, getDefaultVillageId } from "@/config/apiConfig";

export interface AdminUser {
  userId: string;
  email: string;
  fullName: string;
  mobile?: string;
  aadharNumber?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  villageId?: string;
  isActive: boolean;
  roles: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedUsers {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UserListParams {
  villageId?: string;
  page?: number;
  size?: number;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  search?: string;
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

// Backend response format for users list
interface BackendUsersResponse {
  content: Array<{
    userId: string;
    email: string;
    fullName: string;
    mobile?: string;
    approvalStatus: string;
    villageId?: string;
    isActive: boolean;
    roles?: Array<{ id: string; name: string }>;
    createdAt: string;
  }>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class AdminService {
  /**
   * Get paginated list of users
   */
  async getUsers(
    params: UserListParams = {}
  ): Promise<ApiResponse<PaginatedUsers>> {
    const queryParams = new URLSearchParams();

    // Add query parameters
    queryParams.append("villageId", params.villageId || getDefaultVillageId());
    queryParams.append("page", (params.page ?? 0).toString());
    queryParams.append("size", (params.size ?? 20).toString());
    if (params.approvalStatus)
      queryParams.append("approvalStatus", params.approvalStatus);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = `${apiConfig.endpoints.admin.users}?${queryString}`;

    const response = await apiClient.get<
      ApiWrapperResponse<BackendUsersResponse>
    >(endpoint);

    if (response.success && response.data?.data) {
      const backendData = response.data.data;

      // Transform backend response to expected format
      const users: AdminUser[] = backendData.content.map((u) => ({
        userId: u.userId,
        email: u.email,
        fullName: u.fullName,
        mobile: u.mobile,
        approvalStatus: u.approvalStatus as "PENDING" | "APPROVED" | "REJECTED",
        villageId: u.villageId,
        isActive: u.isActive,
        roles: u.roles || [],
        createdAt: u.createdAt,
      }));

      return {
        data: {
          content: users,
          totalElements: backendData.totalElements,
          totalPages: backendData.totalPages,
          number: backendData.number,
          size: backendData.size,
        },
        status: response.status,
        success: true,
      };
    }

    return {
      error:
        response.data?.error?.message ||
        response.error ||
        "Failed to fetch users",
      status: response.status,
      success: false,
    };
  }

  /**
   * Get user details by ID
   */
  async getUserById(
    userId: string,
    villageId?: string
  ): Promise<ApiResponse<AdminUser>> {
    const queryParams = new URLSearchParams();
    queryParams.append("villageId", villageId || getDefaultVillageId());

    const endpoint = `${apiConfig.endpoints.admin.userById(
      userId
    )}?${queryParams.toString()}`;
    const response = await apiClient.get<ApiWrapperResponse<any>>(endpoint);

    if (response.success && response.data?.data) {
      const u = response.data.data;
      return {
        data: {
          userId: u.userId,
          email: u.email,
          fullName: u.fullName,
          mobile: u.mobile,
          aadharNumber: u.aadharNumber,
          approvalStatus: u.approvalStatus,
          rejectionReason: u.rejectionReason,
          villageId: u.villageId,
          isActive: u.isActive,
          roles: u.roles || [],
          createdAt: u.createdAt,
        },
        status: response.status,
        success: true,
      };
    }

    return {
      error:
        response.data?.error?.message ||
        response.error ||
        "Failed to fetch user",
      status: response.status,
      success: false,
    };
  }

  /**
   * Approve a user (POST request as per API spec)
   */
  async approveUser(
    userId: string,
    villageId?: string
  ): Promise<ApiResponse<{ message: string }>> {
    villageId = villageId || getDefaultVillageId();
    const response = await apiClient.post<ApiWrapperResponse<any>>(
      apiConfig.endpoints.admin.approveUser({
        userId,
        villageId,
      }),
      { villageId }
    );

    return {
      data: { message: response.data?.message || "User approved successfully" },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  /**
   * Reject a user with reason (POST request as per API spec)
   */
  async rejectUser(
    userId: string,
    reason: string,
    villageId?: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiWrapperResponse<any>>(
      apiConfig.endpoints.admin.rejectUser(userId),
      {
        villageId: villageId || getDefaultVillageId(),
        userId,
        rejectionReason :reason,
      }
    );

    return {
      data: { message: response.data?.message || "User rejected successfully" },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }

  /**
   * Delete (soft delete) a user
   */
  async deleteUser(
    userId: string,
    villageId?: string
  ): Promise<ApiResponse<{ message: string }>> {
    const queryParams = new URLSearchParams();
    queryParams.append("villageId", villageId || getDefaultVillageId());

    const endpoint = `${apiConfig.endpoints.admin.userById(
      userId
    )}?${queryParams.toString()}`;
    const response = await apiClient.delete<ApiWrapperResponse<any>>(endpoint);

    return {
      data: { message: response.data?.message || "User deleted successfully" },
      status: response.status,
      success: response.success,
      error: response.data?.error?.message || response.error,
    };
  }
}

export const adminService = new AdminService();
export default adminService;

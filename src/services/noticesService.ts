/**
 * Notices Service
 * Handles notices/announcements API calls
 */

import { apiClient, ApiResponse } from './apiClient';
import { apiConfig } from '@/config/apiConfig';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  notice_date: string;
  attachment_url?: string;
  is_active: boolean;
  village_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface NoticesListParams {
  page?: number;
  limit?: number;
  category?: string;
  is_active?: boolean;
}

export interface PaginatedNotices {
  notices: Notice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API wrapper response format
interface ApiWrapperResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string | null;
}

class NoticesService {
  /**
   * Get paginated list of notices
   */
  async getNotices(params: NoticesListParams = {}): Promise<ApiResponse<PaginatedNotices>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('limit', (params.limit ?? 20).toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const endpoint = `/notices?${queryParams.toString()}`;
    const response = await apiClient.get<ApiWrapperResponse<any>>(endpoint);

    if (response.success && response.data?.data) {
      const backendData = response.data.data;
      return {
        data: {
          notices: backendData.notices || [],
          total: backendData.total || 0,
          page: backendData.page || 0,
          limit: backendData.limit || 20,
          totalPages: Math.ceil((backendData.total || 0) / (backendData.limit || 20)),
        },
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to fetch notices',
      status: response.status,
      success: false,
    };
  }

  /**
   * Get notice by ID
   */
  async getNoticeById(noticeId: string): Promise<ApiResponse<Notice>> {
    const response = await apiClient.get<ApiWrapperResponse<Notice>>(
      `/notices/${noticeId}`
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to fetch notice',
      status: response.status,
      success: false,
    };
  }

  /**
   * Create a new notice (admin)
   */
  async createNotice(notice: Partial<Notice>): Promise<ApiResponse<Notice>> {
    const response = await apiClient.post<ApiWrapperResponse<Notice>>(
      '/notices',
      notice
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to create notice',
      status: response.status,
      success: false,
    };
  }

  /**
   * Update a notice (admin)
   */
  async updateNotice(noticeId: string, updates: Partial<Notice>): Promise<ApiResponse<Notice>> {
    const response = await apiClient.put<ApiWrapperResponse<Notice>>(
      `/notices/${noticeId}`,
      updates
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to update notice',
      status: response.status,
      success: false,
    };
  }

  /**
   * Delete a notice (admin)
   */
  async deleteNotice(noticeId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<any>>(
      `/notices/${noticeId}`
    );

    return {
      data: { message: response.data?.message || 'Notice deleted' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }
}

export const noticesService = new NoticesService();
export default noticesService;

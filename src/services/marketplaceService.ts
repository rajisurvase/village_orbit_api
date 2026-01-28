/**
 * Marketplace Service
 * Handles marketplace/buy-sell API calls
 */

import { apiClient, ApiResponse } from './apiClient';
import { apiConfig } from '@/config/apiConfig';

export interface MarketplaceItem {
  id: string;
  item_name: string;
  category: string;
  price: number;
  description?: string;
  village: string;
  contact: string;
  seller_name?: string;
  image_urls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  is_available: boolean;
  rejection_reason?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface MarketplaceListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

export interface PaginatedItems {
  items: MarketplaceItem[];
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

class MarketplaceService {
  /**
   * Get paginated list of marketplace items
   */
  async getItems(params: MarketplaceListParams = {}): Promise<ApiResponse<PaginatedItems>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('limit', (params.limit ?? 20).toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `/marketplace/items?${queryParams.toString()}`;
    const response = await apiClient.get<ApiWrapperResponse<any>>(endpoint);

    if (response.success && response.data?.data) {
      const backendData = response.data.data;
      return {
        data: {
          items: backendData.items || [],
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
      error: response.error || 'Failed to fetch items',
      status: response.status,
      success: false,
    };
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId: string): Promise<ApiResponse<MarketplaceItem>> {
    const response = await apiClient.get<ApiWrapperResponse<MarketplaceItem>>(
      `/marketplace/items/${itemId}`
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to fetch item',
      status: response.status,
      success: false,
    };
  }

  /**
   * Create a new item
   */
  async createItem(item: Partial<MarketplaceItem>): Promise<ApiResponse<MarketplaceItem>> {
    const response = await apiClient.post<ApiWrapperResponse<MarketplaceItem>>(
      '/marketplace/items',
      item
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to create item',
      status: response.status,
      success: false,
    };
  }

  /**
   * Update an item
   */
  async updateItem(itemId: string, updates: Partial<MarketplaceItem>): Promise<ApiResponse<MarketplaceItem>> {
    const response = await apiClient.put<ApiWrapperResponse<MarketplaceItem>>(
      `/marketplace/items/${itemId}`,
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
      error: response.error || 'Failed to update item',
      status: response.status,
      success: false,
    };
  }

  /**
   * Delete an item
   */
  async deleteItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<any>>(
      `/marketplace/items/${itemId}`
    );

    return {
      data: { message: response.data?.message || 'Item deleted' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Approve an item (admin)
   */
  async approveItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.get<ApiWrapperResponse<any>>(
      `/marketplace/items/${itemId}/approve`
    );

    return {
      data: { message: response.data?.message || 'Item approved' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Reject an item (admin)
   */
  async rejectItem(itemId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    const encodedReason = encodeURIComponent(reason);
    const response = await apiClient.get<ApiWrapperResponse<any>>(
      `/marketplace/items/${itemId}/reject?reason=${encodedReason}`
    );

    return {
      data: { message: response.data?.message || 'Item rejected' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;

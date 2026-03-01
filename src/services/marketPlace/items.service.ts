import { apiConfig } from '@/config/apiConfig';
;
import apiClient, { ApiResponse } from '../apiClient';
import { GetFullFilePath } from '../commonService';
import { UploadVillageFile } from '../village-service';
import { Item, ItemListParams, ItemPayload, PaginatedItems } from './items.types';

interface ApiWrapperResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string | null;
}

class ItemsService {
  /**
   * Fetch paginated list of items
   */
  async getItems(params: ItemListParams = {}): Promise<ApiResponse<PaginatedItems>> {
    const query = new URLSearchParams();

    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.limit !== undefined) query.append('limit', String(params.limit));
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if(params.villageId) query.append('villageId', params.villageId);

    const endpoint = `${apiConfig.endpoints.items.list}?${query.toString()}`;
    const response = await apiClient.get<ApiWrapperResponse<PaginatedItems>>(endpoint);

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
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
   * Fetch single item by id
   */
  async getItemById(id: string): Promise<ApiResponse<Item>> {
    const response = await apiClient.get<ApiWrapperResponse<Item>>(
      apiConfig.endpoints.items.byId(id)
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
   * Fetch items belonging to logged in user
   */
  async getMyItems(params: ItemListParams = {}): Promise<ApiResponse<PaginatedItems>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.limit !== undefined) query.append('limit', String(params.limit));
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const endpoint = `${apiConfig.endpoints.items.myItems}?${query.toString()}`;
    const response = await apiClient.get<ApiWrapperResponse<PaginatedItems>>(endpoint);

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to fetch user items',
      status: response.status,
      success: false,
    };
  }

  /**
   * Create an item
   */
  async createItem(payload: ItemPayload): Promise<ApiResponse<Item>> {
    const {villageId, ...rest} = payload 
    const response = await apiClient.post<ApiWrapperResponse<Item>>(
      `${apiConfig.endpoints.items.create}?villageId=${villageId}`,
      {...rest}
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
   * Update existing item
   */
  async updateItem(id: string, updates: Partial<ItemPayload>): Promise<ApiResponse<Item>> {
    const response = await apiClient.put<ApiWrapperResponse<Item>>(
      apiConfig.endpoints.items.update(id),
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
   * Delete item
   */
  async deleteItem(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<any>>(apiConfig.endpoints.items.delete(id));

    return {
      data: { message: response.data?.message || 'Item deleted' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }

  async soldItem(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put<ApiWrapperResponse<any>>(`${apiConfig.endpoints.items.update(id)}/sold`, { sold: true });

    return {
      data: { message: response.data?.message || 'Item sold' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Approve (admin)
   */
  async approveItem(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiWrapperResponse<any>>(apiConfig.endpoints.items.approve(id), {});
    return {
      data: { message: response.data?.message || 'Item approved' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Reject (admin) with reason
   */
  async rejectItem(id: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    const encoded = encodeURIComponent(reason);
    const response = await apiClient.post<ApiWrapperResponse<any>>(
      apiConfig.endpoints.items.reject(id),
      { reason }
    );
    return {
      data: { message: response.data?.message || 'Item rejected' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }

  /**
   * Helper: upload image files using backend signed-url API
   */
  async uploadImages(files: File[], villageId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
     const response = await UploadVillageFile({ file, villageId});
      if (!response.success || !response.data?.fileKey) {
        throw new Error('Failed to get signed url');
      }
      const { fileKey } = response.data;
      urls.push(fileKey);
    }
    return urls;
  }
}

export const itemsService = new ItemsService();
export default itemsService;

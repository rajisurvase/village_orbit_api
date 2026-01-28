/**
 * Feedback Service
 * Handles feedback/complaints API calls
 */

import { FeedbackFormData } from '@/components/FeedbackFormWithShare';
import { apiClient, ApiResponse } from './apiClient';
import { apiConfig } from '@/config/apiConfig';

export interface Feedback {
  id: string;
  name: string;
  mobile: string;
  message: string;
  type: string;
  status: 'pending' | 'reviewed' | 'resolved';
  response?: string;
  village_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface FeedbackListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export interface PaginatedFeedback {
  feedback: Feedback[];
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

class FeedbackService {
  /**
   * Get paginated list of feedback (admin)
   */
  async getFeedback(params: FeedbackListParams = {}): Promise<ApiResponse<PaginatedFeedback>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('limit', (params.limit ?? 20).toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = `/feedback?${queryParams.toString()}`;
    const response = await apiClient.get<ApiWrapperResponse<any>>(endpoint);

    if (response.success && response.data?.data) {
      const backendData = response.data.data;
      return {
        data: {
          feedback: backendData.feedback || [],
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
      error: response.error || 'Failed to fetch feedback',
      status: response.status,
      success: false,
    };
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(feedbackId: string): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.get<ApiWrapperResponse<Feedback>>(
      `/feedback/${feedbackId}`
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to fetch feedback',
      status: response.status,
      success: false,
    };
  }


  /**
   * Respond to feedback (admin)
   */
  async respondToFeedback(feedbackId: string, response_message: string): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.post<ApiWrapperResponse<Feedback>>(
      `/feedback/${feedbackId}/respond`,
      { response: response_message }
    );

    if (response.success && response.data?.data) {
      return {
        data: response.data.data,
        status: response.status,
        success: true,
      };
    }

    return {
      error: response.error || 'Failed to respond to feedback',
      status: response.status,
      success: false,
    };
  }

  /**
   * Delete feedback (admin)
   */
  async deleteFeedback(feedbackId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiWrapperResponse<any>>(
      `/feedback/${feedbackId}`
    );

    return {
      data: { message: response.data?.message || 'Feedback deleted' },
      status: response.status,
      success: response.success,
      error: response.error,
    };
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;


export const SubmitFeedback = async(feedback: FeedbackFormData) => {
  const response = await apiClient.post<ApiWrapperResponse<Feedback>>(
    `${apiConfig.endpoints.feedback.submit}`,
    feedback
  );

  return response.data;
}


export const ContactUs = async(contactData: any) => {
  const response = await apiClient.post<ApiWrapperResponse<null>>(
    `${apiConfig.endpoints.contact.submit}`,
    contactData
  );
  return response.data;
}
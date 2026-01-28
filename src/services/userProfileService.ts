/**
 * User Profile Service
 * Handles user profile API calls
 * Based on VillageOrbit API Documentation
 */

import { apiClient } from './apiClient';
import { apiConfig } from '@/config/apiConfig';

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  mobile?: string;
  aadharNumber?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  villageId?: string;
  roles: Array<{ id: string; name: string }>;
  allPermissions: string[];
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  mobile?: string;
  aadharNumber?: string;
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

// class UserProfileService {
//   /**
//    * Get current user's profile
//    */
//   async getProfile(): Promise<ApiResponse<UserProfile>> {
//     const response = await apiClient.get<ApiWrapperResponse<UserProfile>>(
//       apiConfig.endpoints.profile.get
//     );

//     if (response.success && response.data?.data) {
//       const profile = response.data.data;
//       // Update cached user data
//       tokenService.setUserData(profile as any);
      
//       return {
//         data: profile,
//         status: response.status,
//         success: true,
//       };
//     }

//     return {
//       error: response.data?.error?.message || response.error || 'Failed to fetch profile',
//       status: response.status,
//       success: false,
//     };
//   }

//   /**
//    * Update current user's profile
//    */
//   async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
//     const response = await apiClient.put<ApiWrapperResponse<UserProfile>>(
//       apiConfig.endpoints.profile.update,
//       data
//     );

//     if (response.success && response.data?.data) {
//       const profile = response.data.data;
//       // Update cached user data
//       tokenService.setUserData(profile as any);
      
//       return {
//         data: profile,
//         status: response.status,
//         success: true,
//       };
//     }

//     return {
//       error: response.data?.error?.message || response.error || 'Failed to update profile',
//       status: response.status,
//       success: false,
//     };
//   }
// }

// export const userProfileService = new UserProfileService();
// export default userProfileService;


export const updateUserProfile = async (data: UpdateProfileRequest)=> {
  const response = await apiClient.put<ApiWrapperResponse<UserProfile>>(
    apiConfig.endpoints.profile.update,
    data
  );

  return response.data
};


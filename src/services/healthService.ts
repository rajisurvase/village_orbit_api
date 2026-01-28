/**
 * Health Service
 * Handles backend health check functionality
 */

import { apiClient, ApiResponse } from './apiClient';
import { apiConfig } from '@/config/apiConfig';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  version?: string;
  timestamp?: string;
  services?: {
    database?: 'up' | 'down';
    cache?: 'up' | 'down';
    [key: string]: 'up' | 'down' | undefined;
  };
}

class HealthService {
  private lastHealthCheck: HealthStatus | null = null;
  private lastCheckTime: number = 0;
  private cacheDuration = 30000; // 30 seconds

  /**
   * Get backend health status
   */
  async getHealth(forceRefresh = false): Promise<ApiResponse<HealthStatus>> {
    // Return cached result if recent and not forcing refresh
    if (
      !forceRefresh &&
      this.lastHealthCheck &&
      Date.now() - this.lastCheckTime < this.cacheDuration
    ) {
      return {
        data: this.lastHealthCheck,
        status: 200,
        success: true,
      };
    }

    const response = await apiClient.healthCheck();

    if (response.success && response.data) {
      this.lastHealthCheck = response.data as HealthStatus;
      this.lastCheckTime = Date.now();
    }

    return response as ApiResponse<HealthStatus>;
  }

  /**
   * Check if backend is healthy
   */
  async isHealthy(): Promise<boolean> {
    const response = await this.getHealth();
    return response.success && response.data?.status === 'healthy';
  }

  /**
   * Get last known health status (without API call)
   */
  getLastHealthStatus(): HealthStatus | null {
    return this.lastHealthCheck;
  }

  /**
   * Clear health cache
   */
  clearCache(): void {
    this.lastHealthCheck = null;
    this.lastCheckTime = 0;
  }
}

export const healthService = new HealthService();
export default healthService;

/**
 * Centralized API Client
 * Handles all HTTP requests with token management, error handling,
 * request deduplication, and caching
 */

import { apiConfig } from "@/config/apiConfig";
import { tokenService } from "./tokenService";
import { cache, deduplicateRequest } from "@/lib/cache";
import { CACHE_TTL, HTTP_STATUS } from "@/lib/constants";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface RequestOptions extends RequestInit {
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;

  /** Skip caching for this request */
  skipCache?: boolean;
  /** Custom cache TTL in milliseconds */
  cacheTTL?: number;
  /** Skip request deduplication */
  skipDedup?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private readonly defaultHeaders = {
    "Content-Type": "application/json",
  };

  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(
        `${apiConfig.apiUrl}${apiConfig.endpoints.auth.refreshToken}`,
        {
          method: "POST",
          headers: this.defaultHeaders,
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (!response.ok) {
        tokenService.clearTokens();
        return null;
      }

      const data = await response.json();
      tokenService.setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      tokenService.clearTokens();
      return null;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = tokenService.getAccessToken();
    const headers: Record<string, string> = { ...this.defaultHeaders };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(endpoint: string, options?: RequestInit): string {
    const method = options?.method || "GET";
    const body = options?.body ? String(options.body) : "";
    return `api:${method}:${endpoint}:${body}`;
  }

  private buildQueryParams(
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    if (!params) return "";

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  /**
   * Main request method with caching, deduplication, and retry logic
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    const { skipCache, cacheTTL, skipDedup, params, ...fetchOptions } = options;
    // const url = `${apiConfig.apiUrl}${endpoint}`;
    const query = this.buildQueryParams(options.params);
    const url = `${apiConfig.apiUrl}${endpoint}${query}`;

    const method = fetchOptions.method || "GET";
    const isReadRequest = method === "GET";

    // Check cache for GET requests
    // if (isReadRequest && !skipCache) {
    //   const cacheKey = this.getCacheKey(endpoint, fetchOptions);
    //   const cached = cache.get<ApiResponse<T>>(cacheKey);
    //   if (cached) {
    //     return cached;
    //   }
    // }

    // Deduplicate concurrent identical requests
    const dedupKey = this.getCacheKey(endpoint, fetchOptions);
    const executeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const headers = requiresAuth
          ? this.getAuthHeaders()
          : this.defaultHeaders;

        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...headers,
            ...fetchOptions.headers,
          },
        });

        // Handle 401 - Attempt token refresh
        if (response.status === HTTP_STATUS.UNAUTHORIZED && requiresAuth) {
          return this.handleUnauthorized<T>(
            endpoint,
            fetchOptions,
            requiresAuth
          );
        }

        return this.parseResponse<T>(response);
      } catch (error) {
        console.error("API request failed:", error);
        return {
          error: error instanceof Error ? error.message : "Network error",
          status: 0,
          success: false,
        };
      }
    };

    // Use deduplication for read requests
    const result =
      isReadRequest && !skipDedup
        ? await deduplicateRequest(dedupKey, executeRequest)
        : await executeRequest();

    // Cache successful GET responses
    if (isReadRequest && !skipCache && result.success) {
      const cacheKey = this.getCacheKey(endpoint, fetchOptions);
      cache.set(cacheKey, result, cacheTTL ?? CACHE_TTL.SHORT);
    }

    return result;
  }

  /**
   * Handle 401 unauthorized - refresh token and retry
   */
  private async handleUnauthorized<T>(
    endpoint: string,
    options: RequestInit,
    requiresAuth: boolean
  ): Promise<ApiResponse<T>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      const newToken = await this.refreshToken();
      this.isRefreshing = false;

      if (newToken) {
        this.onTokenRefreshed(newToken);
        return this.request<T>(
          endpoint,
          { ...options, skipCache: true },
          requiresAuth
        );
      }

      return {
        error: "Session expired. Please login again.",
        status: HTTP_STATUS.UNAUTHORIZED,
        success: false,
      };
    }

    // Wait for the refresh to complete
    return new Promise((resolve) => {
      this.subscribeTokenRefresh(async () => {
        resolve(
          await this.request<T>(
            endpoint,
            { ...options, skipCache: true },
            requiresAuth
          )
        );
      });
    });
  }

  /**
   * Parse API response
   */
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = response.ok ? await response.json().catch(() => null) : null;
    const errorData = !response.ok
      ? await response.json().catch(() => ({ message: "Request failed" }))
      : null;

    // Ensure error is always a string, never an object
    let errorMessage: string | undefined;
    if (errorData) {
      if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (typeof errorData.error === "string") {
        errorMessage = errorData.error;
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      } else {
        errorMessage = "Request failed";
      }
    }

    return {
      data,
      error: errorMessage,
      status: response.status,
      success: response.ok,
    };
  }

  /**
   * GET request with optional caching
   */
  async get<T = unknown>(
    endpoint: string,
    requiresAuth = true,
    options?: Pick<RequestOptions, "params" | "skipCache" | "cacheTTL">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      { method: "GET", ...options },
      requiresAuth
    );
  }

  /**
   * POST request (invalidates related cache)
   */
  async post<T = unknown>(
    endpoint: string,
    body: unknown,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    // Invalidate cache for this endpoint pattern
    this.invalidateCache(endpoint);

    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(body),
        skipCache: true,
      },
      requiresAuth
    );
  }

  /**
   * PUT request (invalidates related cache)
   */
  async put<T = unknown>(
    endpoint: string,
    body: unknown,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    this.invalidateCache(endpoint);

    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(body),
        skipCache: true,
      },
      requiresAuth
    );
  }

  /**
   * DELETE request (invalidates related cache)
   */
  async delete<T = unknown>(
    endpoint: string,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    this.invalidateCache(endpoint);

    return this.request<T>(
      endpoint,
      { method: "DELETE", skipCache: true },
      requiresAuth
    );
  }

  /**
   * Health check - no auth required, cached briefly
   */
  async healthCheck(): Promise<
    ApiResponse<{ status: string; message?: string }>
  > {
    return this.get(apiConfig.endpoints.health, false, {
      cacheTTL: CACHE_TTL.SHORT,
    });
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidateCache(pattern?: string): void {
    if (pattern) {
      // For now, clear all cache - can be improved to use pattern matching
      cache.clear();
    } else {
      cache.clear();
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    cache.clear();
  }
}

export const apiClient = new ApiClient();
export default apiClient;

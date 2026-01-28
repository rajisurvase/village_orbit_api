/**
 * Token Service
 * Handles secure storage and retrieval of auth tokens
 */

const ACCESS_TOKEN_KEY = 'sv_access_token';
const REFRESH_TOKEN_KEY = 'sv_refresh_token';
const USER_DATA_KEY = 'sv_user_data';

export interface TokenData {
  accessToken: string | null;
  refreshToken: string | null;
}

class TokenService {
  // Get access token from memory/localStorage
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Get refresh token from secure storage
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Store tokens
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Set only access token (for token refresh)
  setAccessToken(accessToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  // Clear all tokens
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }

  // Check if tokens exist
  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  // Store user data
  setUserData(userData: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }

  // Get stored user data
  getUserData(): any | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Parse JWT token to get payload
  parseToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Check if access token is expired
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return true;

    // Check if token expires within 60 seconds
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime - 60000;
  }
}

export const tokenService = new TokenService();
export default tokenService;

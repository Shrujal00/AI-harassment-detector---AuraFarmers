import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, SECURITY_CONFIG } from '@/config';
import type { AuthTokens, ApiError } from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private abortController?: AbortController;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    config: AxiosRequestConfig;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const tokens = this.getTokens();
        if (tokens?.accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        }

        // Add CSRF token if available
        const csrfToken = this.getCSRFToken();
        if (csrfToken && config.headers) {
          config.headers[SECURITY_CONFIG.CSRF_HEADER] = csrfToken;
        }

        // Add request ID for tracking
        if (config.headers) {
          config.headers['X-Request-ID'] = this.generateRequestId();
        }

        return config;
      },
      (error) => {
        return Promise.reject(this.handleRequestError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newTokens = await this.refreshTokens();
            this.processQueue(null, newTokens.accessToken);
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle rate limiting with exponential backoff
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.calculateBackoffDelay(0);
          
          await this.delay(delay);
          return this.client(originalRequest);
        }

        return Promise.reject(this.handleResponseError(error));
      }
    );
  }

  private getTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  }

  private setTokens(tokens: AuthTokens): void {
    localStorage.setItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  }

  private clearTokens(): void {
    localStorage.removeItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);
  }

  private getCSRFToken(): string | null {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async refreshTokens(): Promise<AuthTokens> {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });

    const newTokens = response.data;
    this.setTokens(newTokens);
    return newTokens;
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        if (config.headers && token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        resolve(this.client(config));
      }
    });

    this.failedQueue = [];
  }

  private handleAuthFailure() {
    this.clearTokens();
    // Redirect to login or emit auth failure event
    window.dispatchEvent(new CustomEvent('auth:failure'));
  }

  private calculateBackoffDelay(retryCount: number): number {
    const baseDelay = API_CONFIG.RETRY_DELAY;
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleRequestError(error: any): ApiError {
    return {
      error: 'Request Error',
      message: error.message || 'An error occurred while preparing the request',
      code: 'REQUEST_ERROR',
    };
  }

  private handleResponseError(error: any): ApiError {
    if (error.response) {
      return {
        error: error.response.data?.error || 'Server Error',
        message: error.response.data?.message || 'An error occurred on the server',
        code: error.response.data?.code || `HTTP_${error.response.status}`,
        details: error.response.data?.details,
      };
    }

    if (error.request) {
      return {
        error: 'Network Error',
        message: 'Unable to reach the server. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    return {
      error: 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Authentication methods
  login(tokens: AuthTokens): void {
    this.setTokens(tokens);
  }

  logout(): void {
    this.clearTokens();
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.accessToken;
  }

  getAccessToken(): string | null {
    return this.getTokens()?.accessToken || null;
  }

  // File upload methods
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post('/api/analyze/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  }

  // Request cancellation
  cancelPendingRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = new AbortController();
    }
  }

  // Set auth tokens (for login)
  setAuthTokens(tokens: AuthTokens): void {
    this.setTokens(tokens);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

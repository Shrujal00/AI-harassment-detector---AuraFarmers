import { apiClient } from './api-client-simple';
import type {
  AnalyzeTextRequest,
  AnalyzeTextResponse,
  FileUploadResponse,
  BatchAnalysisResult,
  AnalysisHistoryResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '@/types/api';

export class HarassmentDetectionAPI {
  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    apiClient.logout();
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    return apiClient.post<{ accessToken: string }>('/auth/refresh');
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  // Analysis endpoints
  async analyzeText(request: AnalyzeTextRequest): Promise<AnalyzeTextResponse> {
    return apiClient.post<AnalyzeTextResponse>('/api/analyze', request);
  }

  async analyzeBatch(texts: string[]): Promise<AnalyzeTextResponse[]> {
    return apiClient.post<{ results: AnalyzeTextResponse[] }>('/api/analyze/batch', { 
      texts,
      include_statistics: true 
    }).then((response: { results: AnalyzeTextResponse[] }) => response.results);
  }

  async filterToxicComments(
    texts: string[], 
    threshold = 0.5, 
    filterType: 'all' | 'harassment' | 'misogyny' = 'all'
  ): Promise<{
    total_comments: number;
    toxic_comments: number;
    filtered_results: AnalyzeTextResponse[];
  }> {
    return apiClient.post('/api/analyze/filter', {
      texts,
      threshold,
      filter_type: filterType,
    });
  }

  // File upload endpoints
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return apiClient.uploadFile(file, onProgress);
  }

  async getJobStatus(jobId: string): Promise<BatchAnalysisResult> {
    return apiClient.get<BatchAnalysisResult>(`/api/jobs/${jobId}`);
  }

  async downloadResults(jobId: string): Promise<Blob> {
    const response = await apiClient.get(`/api/jobs/${jobId}/download`, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  // History and audit endpoints
  async getAnalysisHistory(
    cursor?: string,
    limit = 20
  ): Promise<AnalysisHistoryResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    return apiClient.get<AnalysisHistoryResponse>(`/api/history?${params}`);
  }

  async getAnalysisById(id: string): Promise<AnalyzeTextResponse> {
    return apiClient.get<AnalyzeTextResponse>(`/api/analysis/${id}`);
  }

  async deleteAnalysis(id: string): Promise<void> {
    return apiClient.delete(`/api/analysis/${id}`);
  }

  // Admin endpoints
  async getSystemHealth(): Promise<{
    status: string;
    models_loaded: boolean;
    version: string;
  }> {
    return apiClient.get('/api/health');
  }

  async getModelsInfo(): Promise<{
    harassment_model: any;
    misogyny_model: any;
    combined_weights: any;
  }> {
    return apiClient.get('/api/models/info');
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.getSystemHealth();
      return true;
    } catch {
      return false;
    }
  }

  // Cancel all pending requests
  cancelRequests(): void {
    apiClient.cancelPendingRequests();
  }
}

// Create singleton instance
export const harassmentAPI = new HarassmentDetectionAPI();

export default harassmentAPI;

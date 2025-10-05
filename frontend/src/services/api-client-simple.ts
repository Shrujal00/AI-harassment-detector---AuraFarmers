import type { AuthTokens } from '@/types/api';

// Simple API client for harassment detection
export const apiClient = {
  setAuthTokens: (tokens: AuthTokens) => {
    localStorage.setItem('harassmentDetector_tokens', JSON.stringify(tokens));
  },
  
  logout: () => {
    localStorage.removeItem('harassmentDetector_tokens');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('harassmentDetector_tokens');
  },
  
  getAccessToken: () => {
    const tokens = localStorage.getItem('harassmentDetector_tokens');
    return tokens ? JSON.parse(tokens).accessToken : null;
  },
  
  get: async (url: string) => {
    const response = await fetch(`http://localhost:5000${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.getAccessToken()}`,
      },
    });
    return response.json();
  },
  
  post: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await fetch(`http://localhost:5000${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.getAccessToken()}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json() as T;
  },
  
  delete: async (url: string) => {
    const response = await fetch(`http://localhost:5000${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.getAccessToken()}`,
      },
    });
    return response.json();
  },
  
  uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
    console.log('[API Client] Uploading file:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('[API Client] Sending file upload request...');
      const response = await fetch('http://localhost:5000/api/analyze/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getAccessToken()}`,
        },
        body: formData,
      });
      
      console.log('[API Client] Upload response status:', response.status);
      const data = await response.json();
      console.log('[API Client] Upload response data:', data);
      return data;
    } catch (err) {
      console.error('[API Client] Error uploading file:', err);
      throw err;
    }
  },
  
  cancelPendingRequests: () => {
    // Placeholder for fetch-based client
  },
};

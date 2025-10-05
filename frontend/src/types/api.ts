// Base API types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastActive: string;
}

export type UserRole = 'admin' | 'moderator' | 'user';

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Analysis types
export interface AnalyzeTextRequest {
  text: string;
  threshold?: number;
  include_details?: boolean;
}

export interface ModelPrediction {
  label: 'toxic' | 'non-toxic';
  confidence: number;
  threshold: number;
}

export interface ToxicityScores {
  harassment: number;
  misogyny: number;
  combined: number;
}

export interface AnalysisResult {
  text: string;
  predictions: {
    harassment: ModelPrediction;
    misogyny: ModelPrediction;
  };
  toxicity_scores: ToxicityScores;
  is_toxic: boolean;
  is_harassment: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flagged_categories: string[];
  explanation?: string;
}

export interface AnalyzeTextResponse {
  text: string;
  predictions: {
    harassment: ModelPrediction;
    misogyny: ModelPrediction;
  };
  toxicity_scores: ToxicityScores;
  is_toxic: boolean;
  is_harassment: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flagged_categories: string[];
  explanation?: string;
}

// Batch analysis types
export interface BatchAnalysisRequest {
  texts: string[];
  threshold?: number;
  include_statistics?: boolean;
}

export interface BatchAnalysisStats {
  total_comments: number;
  toxic_comments: number;
  toxic_percentage: number;
  harassment_count: number;
  harassment_percentage: number;
  misogyny_count: number;
  misogyny_percentage: number;
  average_scores: {
    harassment: number;
    misogyny: number;
    combined: number;
  };
  risk_distribution: Record<string, number>;
}

export interface BatchAnalysisResponse {
  results: AnalyzeTextResponse[];
  statistics?: BatchAnalysisStats;
  processing_time: number;
}

// File upload types
export interface FileUploadResponse {
  jobId: string;
  filename: string;
  totalTexts: number;
  estimatedTime: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface BatchAnalysisResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: AnalyzeTextResponse[];
  statistics?: BatchAnalysisStats;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// Filter types
export interface FilterRequest {
  texts: string[];
  threshold?: number;
  filter_type?: 'all' | 'harassment' | 'misogyny';
}

export interface FilterResponse {
  total_comments: number;
  toxic_comments: number;
  filtered_results: AnalyzeTextResponse[];
  statistics: BatchAnalysisStats;
}

// History types
export interface AnalysisHistoryItem {
  id: string;
  text: string;
  result: AnalysisResult;
  timestamp: string;
  userId?: string;
}

export interface AnalysisHistoryResponse {
  analyses: AnalysisHistoryItem[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

// System health types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  models_loaded: boolean;
  api_version: string;
  uptime: number;
  memory_usage?: number;
  request_count?: number;
}

// Model info types
export interface ModelInfo {
  harassment_model: {
    name: string;
    version: string;
    accuracy: number;
    last_trained: string;
  };
  misogyny_model: {
    name: string;
    version: string;
    accuracy: number;
    last_trained: string;
  };
  toxicity_weights: {
    harassment: number;
    misogyny: number;
  };
}

// Runtime config types
export interface RuntimeConfig {
  api_url: string;
  features: {
    batch_analysis: boolean;
    file_upload: boolean;
    history: boolean;
  };
  limits: {
    max_text_length: number;
    max_batch_size: number;
    max_file_size: number;
  };
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  CSRF_HEADER: 'X-CSRF-Token',
  REQUEST_ID_HEADER: 'X-Request-ID',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.txt', '.csv', '.json'],
} as const;

// Analysis Configuration
export const ANALYSIS_CONFIG = {
  DEFAULT_THRESHOLD: 0.5,
  MAX_BATCH_SIZE: 100,
  MAX_TEXT_LENGTH: 500,
  RISK_LEVELS: {
    low: { color: 'green', threshold: 0.3 },
    medium: { color: 'yellow', threshold: 0.6 },
    high: { color: 'orange', threshold: 0.8 },
    critical: { color: 'red', threshold: 1.0 },
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 0.3,
  TOAST_DURATION: 5000,
  POLLING_INTERVAL: 2000,
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_BATCH_ANALYSIS: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_HISTORY: true,
  ENABLE_ADMIN_PANEL: false,
} as const;

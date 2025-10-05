import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format confidence score as percentage
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`
}

// Format risk level with appropriate styling
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return 'text-success bg-success bg-opacity-10 border-success'
    case 'medium':
      return 'text-warning bg-warning bg-opacity-10 border-warning'
    case 'high':
      return 'text-danger bg-danger bg-opacity-10 border-danger'
    case 'critical':
      return 'text-danger bg-danger bg-opacity-25 border-danger'
    default:
      return 'text-secondary bg-light border-secondary'
  }
}

// Format processing time
export function formatProcessingTime(timeMs: number): string {
  if (timeMs < 1000) {
    return `${timeMs.toFixed(0)}ms`
  }
  return `${(timeMs / 1000).toFixed(2)}s`
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Format timestamp
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

// Generate request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait) as unknown as number
  }
}

// Validate text input
export function validateTextInput(text: string, maxLength: number = 500): {
  isValid: boolean;
  error?: string;
} {
  if (!text.trim()) {
    return { isValid: false, error: 'Text cannot be empty' }
  }
  
  if (text.length > maxLength) {
    return { isValid: false, error: `Text must be ${maxLength} characters or less` }
  }
  
  return { isValid: true }
}

// Calculate overall risk score
export function calculateOverallRisk(harassmentScore: number, misogynyScore: number): {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
} {
  const combined = Math.max(harassmentScore, misogynyScore)
  
  if (combined < 0.3) return { score: combined, level: 'low' }
  if (combined < 0.6) return { score: combined, level: 'medium' }
  if (combined < 0.8) return { score: combined, level: 'high' }
  return { score: combined, level: 'critical' }
}

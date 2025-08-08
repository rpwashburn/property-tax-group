import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number as currency (USD)
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A' // Handle null/undefined explicitly
  // Ensure it's a number before formatting
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value
  if (isNaN(numericValue)) return 'Invalid Number'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0, // No cents
    minimumFractionDigits: 0,
  }).format(numericValue)
}

// Format number as percentage
export const formatPercent = (value: number | string | null | undefined, options?: Intl.NumberFormatOptions): string => {
  if (value === null || value === undefined) return 'N/A'
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numericValue)) return 'Invalid Number'

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...(options || {}),
  }
  return new Intl.NumberFormat('en-US', defaultOptions).format(numericValue)
}

// PDF-specific formatting utilities
// Format percentage for display (shows as "5.25%" format)  
export const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return "N/A"
  return `${value.toFixed(2)}%`
}

// PDF-specific utilities for styling and formatting
export const pdfUtils = {
  /**
   * Get CSS color class for adjustment values (for HTML/CSS styling)
   */
  getAdjustmentColorClass: (value: number | undefined): string => {
    if (value === undefined) return "text-gray-600"
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-600"
  },

  /**
   * Get React PDF style object for adjustment values
   */
  getAdjustmentStyle: (value: number | undefined) => {
    if (value === undefined) return {}
    if (value > 0) return { color: '#16A34A' } // green-600
    if (value < 0) return { color: '#DC2626' } // red-600
    return {}
  },

  /**
   * Get priority style for React PDF
   */
  getPriorityStyle: (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { backgroundColor: '#DC2626', color: '#FFFFFF' } // red
      case 'medium': return { backgroundColor: '#3B82F6', color: '#FFFFFF' } // blue  
      case 'low': return { backgroundColor: '#6B7280', color: '#FFFFFF' } // gray
      default: return { backgroundColor: '#3B82F6', color: '#FFFFFF' }
    }
  }
}

// Helper function to safely convert values that could be numbers or strings
export const safeParseFloat = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]+/g, "")
    return Number.parseFloat(cleaned) || 0
  }
  return 0
}

// Helper function to safely parse integers 
export const safeParseInt = (value: string | number | null | undefined, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'number') return Math.floor(value)
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]+/g, "")
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

// Helper function to format large numbers with thousand separators
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A'
  const numericValue = typeof value === 'string' ? safeParseFloat(value) : value
  if (isNaN(numericValue)) return 'N/A'
  return numericValue.toLocaleString('en-US')
}

// File utility functions
export const fileUtils = {
  /**
   * Validates if a file is an acceptable image type
   */
  isValidImageFile: (file: File): boolean => {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return acceptedTypes.includes(file.type)
  },

  /**
   * Formats file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Gets a shortened display name for a file
   */
  getDisplayFileName: (fileName: string, maxLength: number = 20): string => {
    if (fileName.length <= maxLength) return fileName
    const extension = fileName.split('.').pop()
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4)
    return `${truncatedName}...${extension}`
  },

  /**
   * Validates file size (max 10MB)
   */
  isValidFileSize: (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  },

  /**
   * Creates a comprehensive file validation result
   */
  validateFile: (file: File): { isValid: boolean; error?: string } => {
    if (!fileUtils.isValidImageFile(file)) {
      return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' }
    }
    
    if (!fileUtils.isValidFileSize(file)) {
      return { isValid: false, error: 'File size must be less than 10MB' }
    }
    
    return { isValid: true }
  }
}

// Tax savings calculations
export const taxUtils: {
  DEFAULT_HOUSTON_TAX_RATE: number
  calculateSavings: (currentAppraisedValue: number | string | null | undefined, proposedMedianValue: number | string | null | undefined, taxRate?: number) => number
  formatTaxRate: (rate: number) => string
  parsePercentageToDecimal: (percentageStr: string) => number
} = {
  /**
   * Default Houston/Harris County tax rate (as decimal)
   * Set to 2% for conservative estimates
   */
  DEFAULT_HOUSTON_TAX_RATE: 0.0175,

  /**
   * Calculate property tax savings based on current vs proposed value
   * Formula: (Current Appraised Value - Proposed Median Value) × Tax Rate
   * @param currentAppraisedValue - Current appraised value of the property
   * @param proposedMedianValue - Proposed median value from comparables
   * @param taxRate - Tax rate as decimal (default: Houston rate of 1.57%)
   * @returns Annual tax savings amount (negative if proposed value is higher)
   */
  calculateSavings: (
    currentAppraisedValue: number | string | null | undefined,
    proposedMedianValue: number | string | null | undefined,
    taxRate: number = taxUtils.DEFAULT_HOUSTON_TAX_RATE
  ): number => {
    const currentValue = safeParseFloat(currentAppraisedValue)
    const proposedValue = safeParseFloat(proposedMedianValue)
    
    if (currentValue === 0 || proposedValue === 0) return 0
    
    const valueDifference = currentValue - proposedValue
    return valueDifference * taxRate
  },

  /**
   * Format tax rate as percentage string
   * @param rate - Tax rate as decimal (e.g., 0.0157)
   * @returns Formatted percentage string (e.g., "1.57%")
   */
  formatTaxRate: (rate: number): string => {
    return `${(rate * 100).toFixed(2)}%`
  },

  /**
   * Convert percentage string to decimal
   * @param percentageStr - Percentage string (e.g., "1.57%")
   * @returns Tax rate as decimal (e.g., 0.0157)
   */
  parsePercentageToDecimal: (percentageStr: string): number => {
    const cleanStr = percentageStr.replace('%', '').trim()
    const percentage = parseFloat(cleanStr)
    return isNaN(percentage) ? taxUtils.DEFAULT_HOUSTON_TAX_RATE : percentage / 100
  }
}

// Email validation utilities
export const emailUtils = {
  /**
   * Validates email format using a comprehensive regex pattern
   */
  isValidEmail: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false
    
    // Comprehensive email regex pattern
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    return emailRegex.test(email.trim())
  },

  /**
   * Validates email format and provides user-friendly error messages
   */
  validateEmail: (email: string): { isValid: boolean; error?: string } => {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email address is required' }
    }
    
    const trimmedEmail = email.trim()
    
    if (!emailUtils.isValidEmail(trimmedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }
    
    return { isValid: true }
  },

  /**
   * Normalizes email address (trims and converts to lowercase)
   */
  normalizeEmail: (email: string): string => {
    return email.trim().toLowerCase()
  }
}

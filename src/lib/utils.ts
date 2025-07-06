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

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

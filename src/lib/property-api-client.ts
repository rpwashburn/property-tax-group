"use server"

import type { ApiPropertyResponse } from '@/lib/property-analysis/types/index';

interface PropertyApiError extends Error {
  status?: number;
  statusText?: string;
}

/**
 * Get the API base URL from environment or default
 */
function getApiBaseUrl(): string {
  return process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
}

/**
 * Fetch property data by account number with all related data
 * @param accountNumber - The property account number
 * @returns Promise<ApiPropertyResponse | null>
 */
export async function getPropertyByAccount(accountNumber: string): Promise<ApiPropertyResponse | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/v1/properties/account/${accountNumber}?include=buildings&include=owners&include=assessments&include=geographic`;
    
    console.log(`[PropertyApiClient] Fetching property data from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add caching for better performance
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[PropertyApiClient] Property not found for account: ${accountNumber}`);
        return null;
      }
      
      const error: PropertyApiError = new Error(`API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    const data: ApiPropertyResponse = await response.json();
    
    console.log(`[PropertyApiClient] Successfully fetched property data for account: ${accountNumber}`);
    return data;
    
  } catch (error) {
    console.error(`[PropertyApiClient] Error fetching property data for account ${accountNumber}:`, error);
    
    if (error instanceof Error && 'status' in error) {
      // Re-throw API errors as-is
      throw error;
    }
    
    // Wrap other errors
    throw new Error(`Failed to fetch property data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if the API is healthy/reachable
 * @returns Promise<boolean>
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Convenience function to get property data by account number
 * @param accountNumber - The property account number
 * @returns Promise<ApiPropertyResponse | null>
 */
export async function getPropertyDataByAccountNumber(accountNumber: string): Promise<ApiPropertyResponse | null> {
  return getPropertyByAccount(accountNumber);
} 
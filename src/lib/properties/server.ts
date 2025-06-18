"use server"

import type { 
  ApiPropertyResponse, 
  PropertyApiOptions,
  PropertySearchResponse 
} from './types/types';

/**
 * Get the API base URL from environment or default
 */
function getApiBaseUrl(): string {
  return process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
}

/**
 * Utility function to build property API URLs with proper query parameters
 */
function buildPropertyApiUrl(baseUrl: string, endpoint: string, options: {
  accountNumber?: string;
  include?: string[];
  [key: string]: string | string[] | number | boolean | undefined;
}): string {
  try {
    const url = new URL(`${baseUrl}${endpoint}`);
    
    if (options.include && options.include.length > 0) {
      // Use comma-separated includes instead of multiple include parameters
      url.searchParams.set('include', options.include.join(','));
    }
    
    // Add any other query parameters
    Object.entries(options).forEach(([key, value]) => {
      if (key !== 'include' && key !== 'accountNumber' && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
    
    return url.toString();
  } catch (error) {
    console.error('[PropertyAPI] Error building URL:', error);
    console.error('[PropertyAPI] Base URL:', baseUrl);
    console.error('[PropertyAPI] Endpoint:', endpoint);
    console.error('[PropertyAPI] Options:', options);
    throw new Error(`Invalid URL construction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create fetch options with proper headers and caching
 */
function createFetchOptions(options: PropertyApiOptions = {}): RequestInit {
  const fetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      // Don't set Content-Type for GET requests - can cause issues with some APIs
      // 'Content-Type': 'application/json',
      // Add ngrok bypass header to avoid browser warning page
      'ngrok-skip-browser-warning': 'true',
      // Add user agent to look more like a legitimate request
      'User-Agent': 'FightYourTax-AI-API/1.0',
    },
  };

  // Add caching options
  if (options.cache !== false) {
    fetchOptions.next = { 
      revalidate: options.revalidate || 300 // Default 5 minutes cache
    };
  } else {
    fetchOptions.cache = 'no-store';
  }

  return fetchOptions;
}

/**
 * Handle API response with proper error handling and logging
 */
async function handleApiResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    console.log(`[PropertyAPI] Response status: ${response.status}`);
    console.log(`[PropertyAPI] Response statusText: ${response.statusText}`);
    
    // Log response headers for debugging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`[PropertyAPI] Response headers:`, JSON.stringify(headers, null, 2));
    
    // Try to get the response body for more details
    try {
      const errorBody = await response.text();
      console.log(`[PropertyAPI] ${response.status} Response body:`, errorBody);
    } catch (bodyError) {
      console.log(`[PropertyAPI] Could not read response body:`, bodyError);
    }
    
    throw new Error(`API request failed: ${response.status} ${response.statusText}`, {
      cause: { status: response.status, statusText: response.statusText }
    });
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (parseError) {
    console.error('[PropertyAPI] Failed to parse JSON response:', parseError);
    return null;
  }
}

/**
 * Fetch property data by account number with all related data
 * @param accountNumber - The property account number
 * @param options - API options including what to include
 * @returns Promise<ApiPropertyResponse | null>
 */
export async function getPropertyByAccount(
  accountNumber: string,
  options: PropertyApiOptions = {}
): Promise<ApiPropertyResponse | null> {
  if (!accountNumber?.trim()) {
    throw new Error('Account number is required');
  }

  try {
    const baseUrl = getApiBaseUrl();
    const defaultIncludes = ['buildings', 'owners', 'assessments', 'geographic'];
    const includes = options.include || defaultIncludes;
    
    const url = buildPropertyApiUrl(baseUrl, `/api/v1/properties/account/${accountNumber}`, {
      include: includes
    });
    
    console.log(`[PropertyAPI] Fetching property data from: ${url}`);
    
    const response = await fetch(url, createFetchOptions(options));
    const data = await handleApiResponse<ApiPropertyResponse>(response);
    
    if (data) {
      console.log(`[PropertyAPI] Successfully fetched property data for account: ${accountNumber}`);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error(`[PropertyAPI] Error fetching property data for account ${accountNumber}:`, error);
    throw error instanceof Error ? error : new Error('Failed to fetch property data');
  }
}

/**
 * Fetch property data by account number for property analysis
 * @param accountNumber - The property account number
 * @param options - API options
 * @returns Promise<ApiPropertyResponse | null>
 */
export async function getPropertyDataForAnalysis(
  accountNumber: string,
  options: PropertyApiOptions = {}
): Promise<ApiPropertyResponse | null> {
  const analysisIncludes: Array<'buildings' | 'owners' | 'assessments' | 'geographic' | 'extraFeatures'> = ['buildings', 'owners', 'extraFeatures'];
  return getPropertyByAccount(accountNumber, {
    ...options,
    include: options.include || analysisIncludes
  });
}

/**
 * Convenience function - alias for getPropertyByAccount
 * @param accountNumber - The property account number
 * @param options - API options
 * @returns Promise<ApiPropertyResponse | null>
 */
export async function getPropertyDataByAccountNumber(
  accountNumber: string,
  options: PropertyApiOptions = {}
): Promise<ApiPropertyResponse | null> {
  return getPropertyByAccount(accountNumber, options);
}

/**
 * Search for properties by various criteria
 * @param searchParams - Search parameters
 * @param options - API options
 * @returns Promise<PropertySearchResponse>
 */
export async function searchProperties(
  searchParams: Record<string, string | number | boolean>,
  options: PropertyApiOptions = {}
): Promise<PropertySearchResponse> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = buildPropertyApiUrl(baseUrl, '/api/v1/properties/search', {
      ...searchParams,
      include: options.include
    });
    
    console.log(`[PropertyAPI] Searching properties: ${url}`);
    
    const response = await fetch(url, createFetchOptions(options));
    const data = await handleApiResponse<PropertySearchResponse>(response);
    
    if (!data) {
      throw new Error('Search returned null response');
    }
    
    console.log(`[PropertyAPI] Found ${data.total} properties`);
    return data;
    
  } catch (error) {
    console.error('[PropertyAPI] Error searching properties:', error);
    throw error instanceof Error ? error : new Error('Failed to search properties');
  }
}

/**
 * Get properties in a specific neighborhood
 * @param neighborhoodCode - The neighborhood code
 * @param options - API options
 * @returns Promise<PropertySearchResponse>
 */
export async function getPropertiesByNeighborhood(
  neighborhoodCode: string,
  options: PropertyApiOptions = {}
): Promise<PropertySearchResponse> {
  return searchProperties({ neighborhoodCode }, options);
}

/**
 * Get comparable properties for a given property
 * @param accountNumber - The property account number
 * @param options - API options
 * @returns Promise<PropertySearchResponse>
 */
export async function getComparableProperties(
  accountNumber: string,
  options: PropertyApiOptions = {}
): Promise<PropertySearchResponse> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = buildPropertyApiUrl(baseUrl, `/api/v1/properties/account/${accountNumber}/comparables`, {
      include: options.include
    });
    
    console.log(`[PropertyAPI] Fetching comparables: ${url}`);
    
    const response = await fetch(url, createFetchOptions(options));
    const data = await handleApiResponse<PropertySearchResponse>(response);
    
    if (!data) {
      throw new Error('Comparables search returned null response');
    }
    
    console.log(`[PropertyAPI] Found ${data.total} comparable properties`);
    return data;
    
  } catch (error) {
    console.error(`[PropertyAPI] Error fetching comparable properties:`, error);
    throw error instanceof Error ? error : new Error('Failed to fetch comparable properties');
  }
}
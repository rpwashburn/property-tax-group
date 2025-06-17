"use server"

import type { 
  ApiPropertyResponse, 
  PropertyApiError, 
  PropertyApiOptions,
  PropertyApiHealthResponse,
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
      'User-Agent': 'Property-Tax-Group-API/1.0',
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
 * Handle API response and errors
 */
async function handleApiResponse<T>(response: Response, accountNumber?: string): Promise<T | null> {
  if (!response.ok) {
    if (response.status === 404) {
      console.log(`[PropertyAPI] Property not found${accountNumber ? ` for account: ${accountNumber}` : ''}`);
      return null;
    }
    
    const error: PropertyApiError = new Error(`API request failed: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.statusText = response.statusText;
    throw error;
  }

  const data = await response.json();
  return data;
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
    
    // Enhanced debugging for production
    console.log(`[PropertyAPI] Environment: ${process.env.NODE_ENV}`);
    console.log(`[PropertyAPI] PROPERTY_API_BASE_URL: ${process.env.PROPERTY_API_BASE_URL}`);
    console.log(`[PropertyAPI] Base URL: ${baseUrl}`);
    console.log(`[PropertyAPI] Account Number: ${accountNumber}`);
    console.log(`[PropertyAPI] Includes: ${JSON.stringify(includes)}`);
    console.log(`[PropertyAPI] Final URL: ${url}`);
    
    const fetchOptions = createFetchOptions(options);
    console.log(`[PropertyAPI] Fetch options: ${JSON.stringify(fetchOptions, null, 2)}`);
    console.log(`[PropertyAPI] Request headers being sent: ${JSON.stringify(fetchOptions.headers)}`);
    
    const response = await fetch(url, fetchOptions);
    
    // Log response details for debugging
    console.log(`[PropertyAPI] Response status: ${response.status}`);
    console.log(`[PropertyAPI] Response statusText: ${response.statusText}`);
    console.log(`[PropertyAPI] Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    // If we get a bad request, try to log the response body for debugging
    if (response.status === 400) {
      try {
        const errorBody = await response.clone().text();
        console.log(`[PropertyAPI] 400 Response body: ${errorBody}`);
      } catch (e) {
        console.log(`[PropertyAPI] Could not read 400 response body: ${e}`);
      }
    }
    
    const data = await handleApiResponse<ApiPropertyResponse>(response, accountNumber);
    
    if (data) {
      console.log(`[PropertyAPI] Successfully fetched property data for account: ${accountNumber}`);
    }
    
    return data;
    
  } catch (error) {
    console.error(`[PropertyAPI] Error fetching property data for account ${accountNumber}:`, error);
    
    if (error instanceof Error && 'status' in error) {
      // Re-throw API errors as-is
      throw error;
    }
    
    // Wrap other errors
    throw new Error(`Failed to fetch property data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    console.error(`[PropertyAPI] Error fetching comparables for ${accountNumber}:`, error);
    throw error instanceof Error ? error : new Error('Failed to fetch comparable properties');
  }
}

/**
 * Check if the Property API is healthy/reachable
 * @returns Promise<PropertyApiHealthResponse>
 */
export async function checkPropertyApiHealth(): Promise<PropertyApiHealthResponse> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ...data
      };
    } else {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('[PropertyAPI] Health check failed:', error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test API connectivity with a known account
 * @param testAccountNumber - Test account number (defaults to a known test account)
 * @returns Promise<boolean>
 */
export async function testPropertyApiConnection(
  testAccountNumber: string = '0520860000040'
): Promise<boolean> {
  try {
    const health = await checkPropertyApiHealth();
    if (health.status !== 'healthy') {
      return false;
    }
    
    // Try to fetch a test property
    const testProperty = await getPropertyByAccount(testAccountNumber, { cache: false });
    return testProperty !== null;
    
  } catch (error) {
    console.error('[PropertyAPI] Connection test failed:', error);
    return false;
  }
}

/**
 * Comprehensive diagnostic function for troubleshooting API issues
 * @returns Promise<object> - Diagnostic information
 */
export async function diagnosePropertyApiIssues(): Promise<{
  environment: string;
  baseUrl: string;
  envVarSet: boolean;
  healthCheck: PropertyApiHealthResponse | { status: 'error'; error: string };
  connectivityTest: boolean;
  sampleUrl: string;
  timestamp: string;
}> {
  const baseUrl = getApiBaseUrl();
  const sampleAccountNumber = '0520860000040';
  
  console.log('[PropertyAPI] Running comprehensive diagnostics...');
  
  // Test health endpoint
  let healthCheck: PropertyApiHealthResponse | { status: 'error'; error: string };
  try {
    healthCheck = await checkPropertyApiHealth();
  } catch (error) {
    healthCheck = { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
  
  // Test basic connectivity
  let connectivityTest = false;
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    connectivityTest = response.ok;
  } catch (error) {
    console.log('[PropertyAPI] Connectivity test failed:', error);
  }
  
  const diagnostics = {
    environment: process.env.NODE_ENV || 'unknown',
    baseUrl: baseUrl,
    envVarSet: !!process.env.PROPERTY_API_BASE_URL,
    healthCheck,
    connectivityTest,
    sampleUrl: buildPropertyApiUrl(baseUrl, `/api/v1/properties/account/${sampleAccountNumber}`, {
      include: ['buildings', 'owners']
    }),
    timestamp: new Date().toISOString()
  };
  
  console.log('[PropertyAPI] Diagnostics results:', JSON.stringify(diagnostics, null, 2));
  return diagnostics;
} 
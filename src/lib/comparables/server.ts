"use server"; // Mark exports as Server Actions

import type { ComparableProperty, AdjustedComparable } from '@/lib/comparables/types';
import type { PropertySearchCriteria } from '@/lib/comparables/types';

import { ComparablesAPIResponse, ComparablesSearchCriteria } from './types'
import { extractSearchCriteriaFromProperty } from './utils'
import type { ApiPropertyResponse } from "@/lib/properties";

// New types for the properties search response
export interface SimilarProperty {
  accountId: string;
  address: string;
  assessedValue: string;
  landValue: string;
  sqFt: string;
  yearBuilt: number;
  condition: string;
  quality: string;
}

export interface PropertiesSearchSummary {
  totalProperties: number;
  avgAssessedValue: string;
  medianAssessedValue: string;
  minAssessedValue: string;
  maxAssessedValue: string;
  avgValuePerSqFt: string;
  medianValuePerSqFt: string;
  avgYearBuilt: number;
  medianYearBuilt: number;
  avgSquareFeet: string;
  medianSquareFeet: string;
  avgLandValue: string;
  medianLandValue: string;
  avgLandArea: string;
  qualityDistribution: Record<string, number>;
  conditionDistribution: Record<string, number>;
}

export interface PropertiesSearchResponse {
  results: SimilarProperty[];
  summary: PropertiesSearchSummary;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// TEMPORARY: Disabled database functions - need to implement via backend API
export async function searchProperties(
    criteria: PropertySearchCriteria,
    limit: number = 1000,
    excludeAcct?: string | null
): Promise<ComparableProperty[]> {
    console.warn('[comparables/server.ts] searchProperties is temporarily disabled - property data moved to backend API');
    console.warn('[comparables/server.ts] Please implement this functionality in your backend API');
    return [];
} 

/**
 * TEMPORARY: Disabled function - needs backend API implementation
 * @param subjectAcct Account number of the subject property.
 * @param criteria Search criteria for finding comparables.
 * @param limit Maximum number of comparables to return.
 * @returns A promise resolving to an empty array (temporarily disabled).
 */
export async function fetchAndAdjustComparables(
    subjectAcct: string, 
    criteria: PropertySearchCriteria,
    limit: number = 50
): Promise<AdjustedComparable[]> {
    console.warn('[comparables/server.ts] fetchAndAdjustComparables is temporarily disabled - property data moved to backend API');
    console.warn('[comparables/server.ts] Please implement this functionality in your backend API');
    return []; // Return empty array temporarily
} 

interface ComparablesApiError extends Error {
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
 * Search for similar properties using the new properties endpoint
 */
export async function searchSimilarProperties(
  stateClass: string,
  neighborhoodCode: string,
  buildingQualityCode: string,
  gradeAdjustment: string
): Promise<PropertiesSearchResponse | null> {
  try {
    const baseUrl = getApiBaseUrl();
    
    // Build the URL with query parameters
    const url = new URL(`${baseUrl}/api/v1/properties`);
    url.searchParams.set('state_class', stateClass);
    url.searchParams.set('neighborhood_code', neighborhoodCode);
    url.searchParams.set('building_quality_code', buildingQualityCode);
    url.searchParams.set('grade_adjustment', gradeAdjustment);
    url.searchParams.set('include', 'buildings');
    url.searchParams.set('include', 'owners');
    
    console.log(`[PropertiesAPI] Searching similar properties from: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`[PropertiesAPI] Request failed: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.warn('[PropertiesAPI] Properties endpoint not found');
        return null;
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: PropertiesSearchResponse = await response.json();
    console.log(`[PropertiesAPI] Received ${data.results?.length || 0} similar properties`);
    
    return data;
  } catch (error) {
    console.error('[PropertiesAPI] Error searching similar properties:', error);
    return null;
  }
}

/**
 * Get comparables data via the backend API
 * This function makes API calls instead of direct database queries
 */
export async function getComparablesData(
  searchCriteria: ComparablesSearchCriteria
): Promise<ComparablesAPIResponse | null> {
  try {
    const baseUrl = getApiBaseUrl();
    
    // TODO: Update this endpoint URL to match your backend API
    const url = `${baseUrl}/api/v1/comparables/search`;
    
    console.log(`[ComparablesAPI] Fetching comparables from: ${url}`);
    console.log(`[ComparablesAPI] Search criteria:`, searchCriteria);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(searchCriteria),
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`[ComparablesAPI] Request failed: ${response.status} ${response.statusText}`);
      
      // If the endpoint doesn't exist yet, return a helpful message
      if (response.status === 404) {
        console.warn('[ComparablesAPI] Comparables endpoint not implemented in backend API yet');
        return {
          comparables: [],
          total_count: 0,
          median_comparable_value: 0
        };
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: ComparablesAPIResponse = await response.json();
    console.log(`[ComparablesAPI] Received ${data.comparables?.length || 0} comparables`);
    
    return data;
  } catch (error) {
    console.error('[ComparablesAPI] Error fetching comparables:', error);
    
    // Return empty result instead of throwing to prevent app crashes
    return {
      comparables: [],
      total_count: 0,
      median_comparable_value: 0
    };
  }
}

/**
 * Get similar properties for a specific property via the backend API
 * Updated to use the new properties search endpoint
 */
export async function getComparablesForProperty(
  accountId: string,
  propertyData: ApiPropertyResponse
): Promise<PropertiesSearchResponse | null> {
  try {
    // Extract the correct parameters from property data
    const stateClass = propertyData.classification?.stateClass || 'A1';
    const neighborhoodCode = propertyData.classification?.neighborhoodCode || '';
    
    // Get building quality parameters from the first building
    const firstBuilding = propertyData.buildings?.[0];
    const buildingQualityCode = firstBuilding?.code || 'A';
    const gradeAdjustment = firstBuilding?.adj || 'A';
    
    console.log(`[PropertiesAPI] Getting similar properties for: ${accountId}`);
    console.log(`[PropertiesAPI] Parameters:`, {
      state_class: stateClass,
      neighborhood_code: neighborhoodCode,
      building_quality_code: buildingQualityCode,
      grade_adjustment: gradeAdjustment
    });
    
    // Use the new properties search endpoint
    return await searchSimilarProperties(
      stateClass,
      neighborhoodCode,
      buildingQualityCode,
      gradeAdjustment
    );
  } catch (error) {
    console.error(`[PropertiesAPI] Error getting similar properties for ${accountId}:`, error);
    return null;
  }
} 

/**
 * Get comparables using specific search parameters (direct API call)
 * This matches the curl command parameters exactly
 */
export async function getComparablesWithParams(
  subjectAccountId: string,
  stateClass: string,
  neighborhoodCode: string,
  buildingQualityCode: string,
  gradeAdjustment: string
): Promise<ComparablesAPIResponse | null> {
  try {
    const baseUrl = getApiBaseUrl();
    
    // Build the URL with query parameters exactly as shown in the curl command
    const url = new URL(`${baseUrl}/api/v1/comparables`);
    url.searchParams.set('subject_account_id', subjectAccountId);
    url.searchParams.set('state_class', stateClass);
    url.searchParams.set('neighborhood_code', neighborhoodCode);
    url.searchParams.set('building_quality_code', buildingQualityCode);
    url.searchParams.set('grade_adjustment', gradeAdjustment);
    
    console.log(`[ComparablesAPI] Fetching comparables from: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`[ComparablesAPI] Request failed: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.warn('[ComparablesAPI] Comparables endpoint not found');
        return {
          comparables: [],
          total_count: 0,
          median_comparable_value: 0
        };
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[ComparablesAPI] Received ${data.comparables?.length || 0} comparables`);
    
    // Map the response to our expected format
    return {
      comparables: data.comparables || [],
      total_count: data.total_found || data.total_count || 0,
      median_comparable_value: data.median_comparable_value || 0
    };
  } catch (error) {
    console.error('[ComparablesAPI] Error fetching comparables:', error);
    
    return {
      comparables: [],
      total_count: 0,
      median_comparable_value: 0
    };
  }
} 
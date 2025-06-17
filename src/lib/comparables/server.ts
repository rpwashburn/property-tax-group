"use server"; // Mark exports as Server Actions

import { db } from '@/drizzle/db';
import { propertyData, structuralElements } from '@/drizzle/schema';
import type { ComparableProperty, AdjustedComparable } from '@/lib/comparables/types';
import type { PropertySearchCriteria } from '@/lib/comparables/types';
import { sql, ilike, and, gte, lte, type SQL, eq, ne, like, isNotNull } from 'drizzle-orm';
import { calculateAdjustments } from './calculations';
import { getComparablePropertyData } from '@/lib/property-analysis/services/property-service';

import { ComparablesAPIResponse, ComparablesSearchCriteria } from './types'
import { extractSearchCriteriaFromProperty } from './utils'
import type { ApiPropertyResponse } from "@/lib/properties";

// Select specific columns for efficiency
const selectedColumns = {
    id: propertyData.id,
    acct: propertyData.acct,
    siteAddr1: propertyData.siteAddr1,
    siteAddr3: propertyData.siteAddr3,
    stateClass: propertyData.stateClass,
    neighborhoodCode: propertyData.neighborhoodCode,
    yrImpr: propertyData.yrImpr,
    bldAr: propertyData.bldAr,
    bldVal: propertyData.bldVal,
    landAr: propertyData.landAr,
    landVal: propertyData.landVal,
    acreage: propertyData.acreage,
    totMktVal: propertyData.totMktVal,
    totApprVal: propertyData.totApprVal,
    xFeaturesVal: propertyData.xFeaturesVal,
};

// Main search function
export async function searchProperties(
    criteria: PropertySearchCriteria,
    limit: number = 1000,
    excludeAcct?: string | null
): Promise<ComparableProperty[]> { // Return type now includes grade/condition
    
    // Subquery for Grade (Building 1 only)
    const gradeSubquery = db.$with('grade_sq').as(
      db.select({
        acct: structuralElements.acct,
        grade: structuralElements.categoryDscr // Alias happens implicitly via key name
      })
      .from(structuralElements)
      .where(and(
          eq(structuralElements.typeDscr, 'Grade Adjustment'),
          eq(structuralElements.bldNum, '1')
      ))
    );
    
    // Subquery for Condition (Building 1 only)
    const conditionSubquery = db.$with('condition_sq').as(
      db.select({
        acct: structuralElements.acct,
        condition: structuralElements.categoryDscr // Alias happens implicitly via key name
      })
      .from(structuralElements)
      .where(and(
          eq(structuralElements.typeDscr, 'Cond / Desir / Util'),
          eq(structuralElements.bldNum, '1')
      ))
    );

    // Base query selecting from propertyData
    let query = db
        .with(gradeSubquery, conditionSubquery) // Include CTEs
        .select({ 
            ...selectedColumns, // Spread the base columns
            // Select grade and condition from the joined CTEs
            grade: gradeSubquery.grade,
            condition: conditionSubquery.condition
        })
        .from(propertyData)
        .leftJoin(gradeSubquery, eq(propertyData.acct, gradeSubquery.acct))
        .leftJoin(conditionSubquery, eq(propertyData.acct, conditionSubquery.acct))
        .$dynamic();

    const conditions: SQL[] = [];

    // Exclude subject account if provided
    if (excludeAcct) {
        conditions.push(ne(propertyData.acct, excludeAcct));
    }

    // Exclude properties with 0, empty, or NULL land/building values
    conditions.push(isNotNull(propertyData.landVal));
    conditions.push(ne(propertyData.landVal, '0')); 
    conditions.push(ne(propertyData.landVal, '')); 
    conditions.push(isNotNull(propertyData.bldVal)); 
    conditions.push(ne(propertyData.bldVal, '0')); 
    conditions.push(ne(propertyData.bldVal, ''));

    // Address filter
    if (criteria.address) {
        conditions.push(ilike(propertyData.siteAddr1, `%${criteria.address}%`));
    }

    // Neighborhood filter
    if (criteria.neighborhoodCode) {
        conditions.push(eq(propertyData.neighborhoodCode, criteria.neighborhoodCode));
    }

    // Year Built filters (with casting)
    if (criteria.minYearBuilt) {
        conditions.push(gte(sql`CAST(${propertyData.yrImpr} AS INTEGER)`, criteria.minYearBuilt));
    }
    if (criteria.maxYearBuilt) {
        conditions.push(lte(sql`CAST(${propertyData.yrImpr} AS INTEGER)`, criteria.maxYearBuilt));
    }

    // Grade Filter - Match base grade (strip +/-)
    if (criteria.grade) {
        // Extract base grade (remove trailing + or -)
        const baseGrade = criteria.grade.replace(/[+-]$/, ''); 
        // Use LIKE to match grades starting with the base grade
        conditions.push(like(gradeSubquery.grade, `${baseGrade}%`)); 
    }

    // Condition Filter - Now filter on the joined subquery result
    if (criteria.condition) {
        conditions.push(eq(conditionSubquery.condition, criteria.condition));
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    // Add limit and order
    // Ordering might need adjustment if joining changes the available columns for order by
    query = query.orderBy(propertyData.acct).limit(limit);

    try {
        const results = await query;
        // The result objects should now include grade and condition directly
        return results as ComparableProperty[];
    } catch (error) {
        console.error("Error searching properties:", error);
        throw new Error("Failed to search properties.");
    }
} 

/**
 * Fetches a subject property, finds comparable properties based on criteria,
 * and calculates adjustments for each comparable.
 * @param subjectAcct Account number of the subject property.
 * @param criteria Search criteria for finding comparables.
 * @param limit Maximum number of comparables to return.
 * @returns A promise resolving to an array of adjusted comparable properties.
 */
export async function fetchAndAdjustComparables(
    subjectAcct: string, 
    criteria: PropertySearchCriteria,
    limit: number = 50 // Default limit
): Promise<AdjustedComparable[]> {
    console.log(`[comparables/server.ts] Fetching & adjusting comparables for: ${subjectAcct}`);
    try {
        // 1. Fetch the subject property using unified service
        const subjectProperty = await getComparablePropertyData(subjectAcct);
        if (!subjectProperty) {
            console.error(`[comparables/server.ts] Subject property not found: ${subjectAcct}`);
            return [];
        }
        console.log(`[comparables/server.ts] Fetched subject: ${subjectProperty.acct}`);

        // 2. Search for comparable properties, excluding the subject
        const comparableProperties = await searchProperties(criteria, limit, subjectAcct);
        console.log(`[comparables/server.ts] Found ${comparableProperties.length} raw comparables.`);

        // 3. Calculate adjustments for each comparable
        const adjustedComparables: AdjustedComparable[] = comparableProperties.map(prop => ({
            ...prop,
            adjustments: calculateAdjustments(subjectProperty, prop)
        }));
        console.log(`[comparables/server.ts] Calculated adjustments for ${adjustedComparables.length} comps.`);

        return adjustedComparables;

    } catch (error) {
        console.error('[comparables/server.ts] Error in fetchAndAdjustComparables:', error);
        return []; // Return empty array on error
    }
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
 * Fetch comparable properties from the backend API
 * @param searchCriteria - The criteria to search for comparable properties
 * @returns Promise<ComparablesAPIResponse | null>
 */
export async function getComparablesData(
  searchCriteria: ComparablesSearchCriteria
): Promise<ComparablesAPIResponse | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = new URL(`${baseUrl}/api/v1/comparables`);
    
    // Add search parameters
    url.searchParams.set("subject_account_id", searchCriteria.subject_account_id);
    url.searchParams.set("state_class", searchCriteria.state_class);
    url.searchParams.set("neighborhood_code", searchCriteria.neighborhood_code);
    url.searchParams.set("quality_condition", searchCriteria.quality_condition);
    
    console.log(`[ComparablesApiClient] Fetching comparables data from: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add cache control for server-side rendering
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[ComparablesApiClient] No comparables found for criteria: ${JSON.stringify(searchCriteria)}`);
        return null;
      }
      
      const error: ComparablesApiError = new Error(`API request failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    
    const data: ComparablesAPIResponse = await response.json();
    
    // Validate the response structure
    if (!data.comparables || !Array.isArray(data.comparables)) {
      console.error('[ComparablesApiClient] Invalid comparables API response structure:', data);
      return null;
    }
    
    console.log(`[ComparablesApiClient] Successfully fetched ${data.comparables.length} comparables for account: ${searchCriteria.subject_account_id}`);
    return data;
    
  } catch (error) {
    console.error(`[ComparablesApiClient] Error fetching comparables data for account ${searchCriteria.subject_account_id}:`, error);
    
    if (error instanceof Error && 'status' in error) {
      // Re-throw API errors as-is
      throw error;
    }
    
    // Wrap other errors
    throw new Error(`Failed to fetch comparables data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get comparable properties for a specific property
 * @param accountId - The account ID of the subject property
 * @param propertyData - The property data for the subject property
 * @returns Promise<ComparablesAPIResponse | null>
 */
export async function getComparablesForProperty(
  accountId: string,
  propertyData: ApiPropertyResponse
): Promise<ComparablesAPIResponse | null> {
  const searchCriteria = extractSearchCriteriaFromProperty(propertyData, accountId)
  return await getComparablesData(searchCriteria)
} 
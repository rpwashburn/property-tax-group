"use server"

// TODO: Updated to use backend API instead of direct database queries
// Property data has been moved to a backend API service

// REMOVED: import { db } from '@/drizzle/db';
// REMOVED: import { propertyData, structuralElements, extraFeaturesDetail } from '@/drizzle/schema';
// REMOVED: import { eq, and, sql } from 'drizzle-orm';

import type { SubjectProperty } from "@/lib/comparables/types";
import type { EnrichedPropertyData } from '@/lib/property-analysis/types/index';
import { extractGradeAndCondition, convertPropertyDataToSubjectProperty, transformApiToEnriched } from '@/lib/property-analysis/utils/property-utils';
import { notFound } from 'next/navigation';
import { getPropertyDataForAnalysis } from '@/lib/properties/server';

/**
 * Get unified property data with all related information for analysis
 * @param accountNumber - The property account number  
 * @returns Promise<EnrichedPropertyData>
 */
export async function getUnifiedPropertyData(accountNumber: string): Promise<EnrichedPropertyData> {
  if (!accountNumber?.trim()) {
    throw new Error('Account number is required');
  }

  try {
    // Use the consolidated property service
    const apiData = await getPropertyDataForAnalysis(accountNumber, {
      include: ['buildings', 'owners', 'extraFeatures'],
      cache: true,
      revalidate: 300 // 5 minutes
    });

    if (!apiData) {
      console.log(`[PropertyService] Property not found for account: ${accountNumber}`);
      throw notFound();
    }

    // Transform API response to legacy format for backward compatibility
    const enrichedData = transformApiToEnriched(apiData);
    
    console.log(`[PropertyService] Successfully retrieved unified property data for account: ${accountNumber}`);
    return enrichedData;

  } catch (error) {
    console.error(`[PropertyService] Error getting unified property data for account ${accountNumber}:`, error);
    
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'NEXT_NOT_FOUND') {
      // Re-throw Next.js not found errors
      throw error;
    }
    
    throw new Error(`Failed to get property data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Legacy alias for backward compatibility
 */
export async function getPropertyDataByAccountNumber(accountNumber: string): Promise<EnrichedPropertyData> {
  return getUnifiedPropertyData(accountNumber);
}

/**
 * Unified function to get SubjectProperty (used by admin and AI analysis)
 * This replaces getPropertyByAcct and any conversion logic
 */
export async function getSubjectProperty(accountNumber: string): Promise<SubjectProperty | null> {
  const propertyData = await getUnifiedPropertyData(accountNumber);
  if (!propertyData) return null;
  
  return convertPropertyDataToSubjectProperty(propertyData);
}

/**
 * TEMPORARY: Disabled function - needs backend API implementation
 * This function used to query the database directly for comparable property data.
 * It should be replaced with API calls to your backend service.
 */
export async function getComparablePropertyData(accountNumber: string): Promise<SubjectProperty | null> {
  console.warn('[property-service.ts] getComparablePropertyData is temporarily disabled - property data moved to backend API');
  console.warn('[property-service.ts] Please implement comparable property data retrieval in your backend API');
  
  // Fallback: Try to get the data through the unified API and convert it
  try {
    const propertyData = await getUnifiedPropertyData(accountNumber);
    if (!propertyData) return null;
    
    return convertPropertyDataToSubjectProperty(propertyData);
  } catch (error) {
    console.error(`Error in fallback getComparablePropertyData for ${accountNumber}:`, error);
    return null;
  }
}

/**
 * TEMPORARY: Disabled function - needs backend API implementation  
 * Extra features detail should be retrieved via the backend API.
 */
export async function getExtraFeaturesDetail(accountNumber: string) {
  console.warn('[property-service.ts] getExtraFeaturesDetail is temporarily disabled - property data moved to backend API');
  console.warn('[property-service.ts] Extra features are now included in the main property API response');
  
  // Fallback: Get extra features from the main API response
  try {
    const apiData = await getPropertyDataForAnalysis(accountNumber, {
      include: ['extraFeatures'],
      cache: true,
      revalidate: 300
    });

    if (!apiData?.extraFeatures) {
      return [];
    }

    // Transform API format to expected format
    return apiData.extraFeatures.map(feature => ({
      type: feature.type,
      description: feature.description,
      grade: feature.grade,
      condition: feature.condition,
      buildingNumber: feature.buildingNumber,
      length: feature.length,
      width: feature.width,
      units: feature.units,
      unitPrice: feature.unitPrice,
      adjustedUnitPrice: feature.adjustedUnitPrice,
      percentComplete: feature.percentComplete,
      actualYear: feature.actualYear,
      effectiveYear: feature.effectiveYear,
      rollYear: feature.rollYear,
      date: feature.date,
      percentCondition: feature.percentCondition,
      depreciatedValue: feature.depreciatedValue,
      note: feature.note,
      assessedValue: feature.assessedValue,
    }));
  } catch (error) {
    console.error('Error fetching extra features detail via API:', error);
    return [];
  }
} 
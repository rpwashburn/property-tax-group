"use server"

import { db } from '@/drizzle/db';
import { propertyData, structuralElements, extraFeaturesDetail } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
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
 * Lightweight function to get just the basic property fields for comparables
 * This replaces the selectedColumns logic in comparables/server.ts
 */
export async function getComparablePropertyData(accountNumber: string): Promise<SubjectProperty | null> {
  try {
    // Query 1: Fetch base property data
    const propertyResult = await db
      .select({
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
      })
      .from(propertyData)
      .where(eq(propertyData.acct, accountNumber))
      .limit(1);

    if (propertyResult.length === 0) return null;
    const baseProperty = propertyResult[0];

    // Query 2: Fetch relevant structural elements separately for Building 1
    const elementsResult = await db
      .select({
        typeDscr: structuralElements.typeDscr,
        categoryDscr: structuralElements.categoryDscr
      })
      .from(structuralElements)
      .where(and(
        eq(structuralElements.acct, accountNumber),
        eq(structuralElements.bldNum, '1'),
        // Only fetch the types we care about
        sql`${structuralElements.typeDscr} IN ('Grade Adjustment', 'Cond / Desir / Util')` 
      ));

    // Extract Grade and Condition using unified function
    const { grade, condition } = extractGradeAndCondition(elementsResult);

    // Construct the final SubjectProperty object
    return {
      ...baseProperty,
      grade,
      condition,
    };

  } catch (error) {
    console.error(`Error fetching comparable property data for ${accountNumber}:`, error);
    return null; 
  }
}

/**
 * Fetches extra features detail for a property
 */
export async function getExtraFeaturesDetail(accountNumber: string) {
  try {
    const extraFeatures = await db
      .select()
      .from(extraFeaturesDetail)
      .where(eq(extraFeaturesDetail.acct, accountNumber));

    return extraFeatures.map(feature => ({
      type: feature.cd,
      description: feature.dscr,
      grade: feature.grade,
      condition: feature.condCd,
      buildingNumber: feature.bldNum,
      length: feature.length,
      width: feature.width,
      units: feature.units,
      unitPrice: feature.unitPrice,
      adjustedUnitPrice: feature.adjUnitPrice,
      percentComplete: feature.pctComp,
      actualYear: feature.actYr,
      effectiveYear: feature.effYr,
      rollYear: feature.rollYr,
      date: feature.dt,
      percentCondition: feature.pctCond,
      depreciatedValue: feature.dprVal,
      note: feature.note,
      assessedValue: feature.asdVal,
    }));
  } catch (error) {
    console.error('Error fetching extra features detail:', error);
    throw error;
  }
} 
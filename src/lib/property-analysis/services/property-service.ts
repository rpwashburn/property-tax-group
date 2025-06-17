"use server"

import { db } from '@/drizzle/db';
import { propertyData, structuralElements, extraFeaturesDetail } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { SubjectProperty } from "@/lib/comparables/types";
import type { EnrichedPropertyData, ApiPropertyResponse } from '@/lib/property-analysis/types/index';
import { extractGradeAndCondition, convertPropertyDataToSubjectProperty } from '@/lib/property-analysis/utils/property-utils';

/**
 * Transform API response to EnrichedPropertyData format
 */
function transformApiResponseToEnrichedData(apiData: ApiPropertyResponse): EnrichedPropertyData {
  return {
    // Core identifiers
    id: apiData.id,
    acct: apiData.accountId,
    
    // Address fields (flattened from address object)
    strNum: apiData.address.streetNumber,
    str: apiData.address.streetName,
    strSfx: apiData.address.streetSuffix,
    strSfxDir: apiData.address.streetSuffixDirection,
    siteAddr1: apiData.address.siteAddress1,
    siteAddr2: apiData.address.siteAddress2,
    siteAddr3: apiData.address.siteAddress3,
    
    // Classification fields (flattened from classification object)
    stateClass: apiData.classification.stateClass,
    schoolDist: apiData.classification.schoolDistrict,
    neighborhoodCode: apiData.classification.neighborhoodCode,
    neighborhoodGrp: apiData.classification.neighborhoodGroup,
    neighborhoodDescription: apiData.classification.neighborhoodDescription,
    jurs: apiData.classification.jurisdiction,
    
    // Market info fields (flattened from marketInfo object)
    marketArea1: apiData.marketInfo.marketArea1,
    marketArea1Dscr: apiData.marketInfo.marketArea1Description,
    marketArea2: apiData.marketInfo.marketArea2,
    marketArea2Dscr: apiData.marketInfo.marketArea2Description,
    econArea: apiData.marketInfo.economicArea,
    econBldClass: apiData.marketInfo.economicBuildingClass,
    
    // Characteristics fields (flattened from characteristics object)
    yrImpr: apiData.characteristics.yearImproved?.toString() || null,
    yrAnnexed: apiData.characteristics.yearAnnexed?.toString() || null,
    bldAr: apiData.characteristics.buildingArea,
    landAr: apiData.characteristics.landArea,
    acreage: apiData.characteristics.acreage,
    
    // Current values (flattened from currentValues object)
    landVal: apiData.currentValues.landValue,
    bldVal: apiData.currentValues.buildingValue,
    xFeaturesVal: apiData.currentValues.extraFeaturesValue,
    agVal: apiData.currentValues.agriculturalValue,
    assessedVal: apiData.currentValues.assessedValue,
    totApprVal: apiData.currentValues.totalAppraisedValue,
    totMktVal: apiData.currentValues.totalMarketValue,
    newConstructionVal: apiData.currentValues.newConstructionValue,
    totRcnVal: apiData.currentValues.totalReplacementCostValue,
    
    // Prior values (flattened from priorValues object)
    priorLandVal: apiData.priorValues.landValue,
    priorBldVal: apiData.priorValues.buildingValue,
    priorXFeaturesVal: apiData.priorValues.extraFeaturesValue,
    priorAgVal: apiData.priorValues.agriculturalValue,
    priorTotApprVal: apiData.priorValues.totalAppraisedValue, // Critical for year-over-year calculation
    priorTotMktVal: apiData.priorValues.totalMarketValue,
    
    // Status fields (flattened from status object)
    valueStatus: apiData.status.valueStatus,
    noticed: apiData.status.noticed,
    noticeDt: apiData.status.noticeDate,
    protested: apiData.status.protested,
    certifiedDate: apiData.status.certifiedDate,
    revDt: apiData.status.revisionDate,
    revBy: apiData.status.revisedBy,
    newOwnDt: apiData.status.newOwnerDate,
    
    // Legal fields (combination of legal fields)
    lgl1: apiData.legal.description || [
      apiData.legal.legalLine1,
      apiData.legal.legalLine2,
      apiData.legal.legalLine3,
      apiData.legal.legalLine4
    ].filter(Boolean).join(' ') || null,
    
    // Metadata (convert string dates to Date objects)
    createdAt: new Date(apiData.metadata.createdAt),
    updatedAt: new Date(apiData.metadata.updatedAt),
    
    // Related data
    structuralElements: apiData.buildings || [],
    fixtures: apiData.fixtures || [],
    extraFeatures: apiData.extraFeatures?.map(feature => ({
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
      // New fields from API
      count: feature.count,
      category: feature.category,
      shortDescription: feature.shortDescription,
    })) || [],
  };
}

/**
 * Fetch property data from external API
 */
async function fetchPropertyDataFromAPI(accountNumber: string): Promise<EnrichedPropertyData | null> {
  const apiBaseUrl = process.env.PROPERTY_API_BASE_URL!; // Non-null assertion since we check in caller

  try {
    const url = `${apiBaseUrl}/api/v1/properties/account/${accountNumber}?include=buildings&include=owners&include=extraFeatures`;
    console.log('Fetching property data from API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Property not found in API for account: ${accountNumber}`);
        return null;
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData: ApiPropertyResponse = await response.json();
    
    // Transform API response to match our EnrichedPropertyData interface
    const transformedData = transformApiResponseToEnrichedData(apiData);

    console.log('Successfully transformed API data for account:', accountNumber);
    return transformedData;
  } catch (error) {
    console.error('Error fetching property data from API:', error);
    throw error;
  }
}

/**
 * Unified function to load complete property data with all related information
 * This loads data from the external API only
 */
export async function getUnifiedPropertyData(accountNumber: string): Promise<EnrichedPropertyData | null> {
  const apiBaseUrl = process.env.PROPERTY_API_BASE_URL;
  
  if (!apiBaseUrl) {
    throw new Error('PROPERTY_API_BASE_URL environment variable is required');
  }

  return await fetchPropertyDataFromAPI(accountNumber);
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
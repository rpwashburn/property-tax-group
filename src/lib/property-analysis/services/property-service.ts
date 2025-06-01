"use server"

import { db } from '@/drizzle/db';
import { propertyData, neighborhoodCodes, structuralElements, fixtures, extraFeaturesDetail } from '@/drizzle/schema';
import { eq, and, type InferSelectModel, sql } from 'drizzle-orm';
import type { EnrichedPropertyData, SubjectProperty } from '@/lib/property-analysis/types/index';
import { extractGradeAndCondition, convertPropertyDataToSubjectProperty } from '@/lib/property-analysis/utils/property-utils';

/**
 * Unified function to load complete property data with all related information
 * This replaces both getPropertyDataByAccountNumber and getPropertyByAcct
 */
export async function getUnifiedPropertyData(accountNumber: string): Promise<EnrichedPropertyData | null> {
  try {
    const [propertyResult, structuralElementsResult, fixturesResult, extraFeaturesResult] = await Promise.all([
      db
        .select()
        .from(propertyData)
        .leftJoin(neighborhoodCodes, eq(propertyData.neighborhoodCode, neighborhoodCodes.code))
        .where(eq(propertyData.acct, accountNumber))
        .limit(1),
      db
        .select()
        .from(structuralElements)
        .where(eq(structuralElements.acct, accountNumber)),
      db
        .select()
        .from(fixtures)
        .where(and(eq(fixtures.acct, accountNumber), eq(fixtures.bldNum, '1'))),
      db
        .select()
        .from(extraFeaturesDetail)
        .where(eq(extraFeaturesDetail.acct, accountNumber))
    ]);

    if (!propertyResult.length) return null;

    const property = propertyResult[0];
    if (!property.property_data.neighborhoodCode) {
      throw new Error('Property data missing required neighborhoodCode');
    }

    const mappedFixtures = fixturesResult.map((fixture: InferSelectModel<typeof fixtures>) => ({
      bldNum: fixture.bldNum,
      type: fixture.type,
      typeDscr: fixture.typeDscr,
      units: Number(fixture.units),
    }));

    const mappedExtraFeatures = extraFeaturesResult.map((feature: InferSelectModel<typeof extraFeaturesDetail>) => ({
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

    return {
      ...property.property_data,
      neighborhoodDescription: property.neighborhood_codes?.description,
      structuralElements: structuralElementsResult.map((element: InferSelectModel<typeof structuralElements>) => ({
        bldNum: element.bldNum,
        code: element.code,
        adj: element.adj,
        type: element.type,
        typeDscr: element.typeDscr,
        categoryDscr: element.categoryDscr,
        dorCd: element.dorCd,
      })),
      fixtures: mappedFixtures,
      extraFeatures: mappedExtraFeatures,
    } as EnrichedPropertyData;
  } catch (error) {
    console.error('Error fetching unified property data:', error);
    throw error;
  }
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
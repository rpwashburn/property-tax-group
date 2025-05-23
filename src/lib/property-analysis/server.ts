"use server"

import { db } from '@/drizzle/db';
import { propertyData, neighborhoodCodes, structuralElements, fixtures } from '@/drizzle/schema';
import { eq, and, type InferSelectModel } from 'drizzle-orm';
import type { PropertyData, AdjustedComparable, SubjectProperty, ComparableProperty } from './types';
import { searchProperties } from '@/lib/comparables/server';
import { calculateAdjustments } from '@/lib/comparables/calculations';
import type { PropertySearchCriteria } from '@/lib/comparables/types';

export async function getPropertyDataByAccountNumber(accountNumber: string): Promise<PropertyData | null> {
  try {
    const [propertyResult, structuralElementsResult, fixturesResult] = await Promise.all([
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
        .where(and(eq(fixtures.acct, accountNumber), eq(fixtures.bldNum, '1')))
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
    } as PropertyData;
  } catch (error) {
    console.error('Error fetching property data:', error);
    throw error;
  }
}

export async function getPropertyDataByAccountNumbers(accountNumbers: string[]): Promise<PropertyData[]> {
  if (!accountNumbers.length) return [];
  
  try {
    const paddedAccountNumbers = accountNumbers.map(num => num.padStart(10, '0'));
    const [propertyResults, structuralElementsResults] = await Promise.all([
      db
        .select()
        .from(propertyData)
        .where(eq(propertyData.acct, paddedAccountNumbers[0])),
      db
        .select()
        .from(structuralElements)
        .where(eq(structuralElements.acct, paddedAccountNumbers[0]))
    ]);

    return propertyResults.map(property => {
      if (!property.neighborhoodCode) {
        throw new Error('Property data missing required neighborhoodCode');
      }
      return {
        ...property,
        neighborhoodDescription: undefined,
        structuralElements: structuralElementsResults
          .filter(element => element.acct === property.acct)
          .map(element => ({
            bldNum: element.bldNum,
            code: element.code,
            adj: element.adj,
            type: element.type,
            typeDscr: element.typeDscr,
            categoryDscr: element.categoryDscr,
            dorCd: element.dorCd,
          })),
      } as PropertyData;
    });
  } catch (error) {
    console.error('Error fetching property data:', error);
    throw error;
  }
}

/**
 * Fetches comparable properties based on search criteria
 */
async function fetchComparables(
  subjectProperty: SubjectProperty,
  criteria: PropertySearchCriteria,
  limit: number = 50
) {
  console.log(`[analysis/server.ts] Fetching comparables for: ${subjectProperty.acct}`);
  
  // Search for comparable properties, excluding the subject
  const comparableProperties = await searchProperties(criteria, limit, subjectProperty.acct);
  console.log(`[analysis/server.ts] Found ${comparableProperties.length} raw comparables.`);
  
  return comparableProperties;
}

/**
 * Applies adjustments to comparable properties
 */
function adjustComparables(
  subjectProperty: SubjectProperty,
  comparableProperties: ComparableProperty[]
): AdjustedComparable[] {
  console.log(`[analysis/server.ts] Calculating adjustments for ${comparableProperties.length} comparables.`);
  
  // Calculate adjustments for each comparable
  const adjustedComparables: AdjustedComparable[] = comparableProperties.map(prop => ({
    ...prop,
    adjustments: calculateAdjustments(subjectProperty, prop)
  }));
  
  console.log(`[analysis/server.ts] Calculated adjustments for ${adjustedComparables.length} comps.`);
  return adjustedComparables;
}

/**
 * Fetches adjusted comparables specifically for the AI report generation.
 * It derives default search criteria from the subject property.
 * @param subjectProperty The subject property object (potentially with overrides applied).
 * @returns A promise resolving to an array of adjusted comparable properties.
 */
export async function getAdjustedComparablesForReport(subjectProperty: SubjectProperty): Promise<AdjustedComparable[]> {
  
  try {
    // Step 1: Define search criteria based on the subject property
    const criteria: PropertySearchCriteria = {
      neighborhoodCode: subjectProperty.neighborhoodCode ?? undefined,
      grade: subjectProperty.grade ?? undefined,
      condition: subjectProperty.condition ?? undefined,
    };

    // Step 2: Fetch comparable properties
    const comparableProperties = await fetchComparables(subjectProperty, criteria, 50);

    // Step 3: Apply adjustments to the comparables
    const adjustedComparables = adjustComparables(subjectProperty, comparableProperties);

    return adjustedComparables;

  } catch (error) {
    console.error(`[analysis/server.ts] Error fetching adjusted comparables for report (${subjectProperty.acct}):`, error);
    // For report generation, we might want to be more resilient and return empty array rather than throwing.
    return []; 
  }
} 
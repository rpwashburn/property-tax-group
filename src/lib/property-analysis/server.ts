"use server"

import { db } from '@/drizzle/db';
import { propertyData, neighborhoodCodes, structuralElements, fixtures } from '@/drizzle/schema';
import { eq, and, type InferSelectModel } from 'drizzle-orm';
import type { PropertyData } from './types';
// Import functions and types needed for comparables calculation
import { getPropertyByAcct, fetchAndAdjustComparables } from '@/lib/comparables/server';
import type { PropertySearchCriteria, AdjustedComparable } from '@/lib/comparables/types';

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

    console.log('Fixtures raw result:', fixturesResult);

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

    console.log('Mapped fixtures:', mappedFixtures);

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
 * Fetches adjusted comparables specifically for the AI report generation.
 * It derives default search criteria from the subject property.
 * @param accountNumber Account number of the subject property.
 * @returns A promise resolving to an array of adjusted comparable properties.
 */
export async function getAdjustedComparablesForReport(accountNumber: string): Promise<AdjustedComparable[]> {
  console.log(`[analysis/server.ts] Getting adjusted comps for report: ${accountNumber}`);
  
  try {
    // 1. Fetch the subject property details needed for criteria
    //    We only need a subset of fields here for criteria generation
    const subjectProperty = await getPropertyByAcct(accountNumber);
    if (!subjectProperty) {
      console.error(`[analysis/server.ts] Subject property not found for report: ${accountNumber}`);
      return []; 
    }

    // 2. Define default search criteria based *only* on the subject property
    const criteria: PropertySearchCriteria = {
      neighborhoodCode: subjectProperty.neighborhoodCode ?? undefined,
      grade: subjectProperty.grade ?? undefined,
      condition: subjectProperty.condition ?? undefined,
      // Consider adding default sqft/year ranges if desired
      // minSqft: subjectProperty.sqft ? Math.round(parseInt(subjectProperty.sqft) * 0.8) : undefined,
      // maxSqft: subjectProperty.sqft ? Math.round(parseInt(subjectProperty.sqft) * 1.2) : undefined,
      // minYearBuilt: subjectProperty.yrImpr ? parseInt(subjectProperty.yrImpr) - 10 : undefined,
      // maxYearBuilt: subjectProperty.yrImpr ? parseInt(subjectProperty.yrImpr) + 10 : undefined,
    };
    console.log('[analysis/server.ts] Default Report Criteria:', criteria);

    // 3. Call the centralized function to fetch and adjust comparables
    const adjustedComparables = await fetchAndAdjustComparables(accountNumber, criteria, 50); // Limit to 50 for report

    console.log(`[analysis/server.ts] Returning ${adjustedComparables.length} adjusted comps for report.`);
    return adjustedComparables;

  } catch (error) {
    console.error('[analysis/server.ts] Error getting adjusted comparables for report:', error);
    return []; 
  }
} 
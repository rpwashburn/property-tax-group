"use server"; // Mark exports as Server Actions

import { db } from '@/drizzle/db';
import { propertyData, structuralElements } from '@/drizzle/schema';
import type { ComparableProperty, AdjustedComparable, SubjectProperty } from '@/lib/property-analysis/types';
import type { PropertySearchCriteria } from '@/lib/comparables/types';
import { sql, ilike, and, gte, lte, type SQL, eq, ne, like, isNotNull } from 'drizzle-orm';
import { calculateAdjustments } from './calculations';

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
    xFeaturesVal: propertyData.xFeaturesVal,
};

// Function to fetch a single property by account number, including grade and condition via separate queries
export async function getPropertyByAcct(acct: string): Promise<SubjectProperty | null> {
    if (!acct) return null;

    try {
        // Query 1: Fetch base property data
        const propertyResult = await db
            .select(selectedColumns) // Use the columns needed for ComparableProperty
            .from(propertyData)
            .where(eq(propertyData.acct, acct))
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
                eq(structuralElements.acct, acct),
                eq(structuralElements.bldNum, '1'),
                // Only fetch the types we care about
                sql`${structuralElements.typeDscr} IN ('Grade Adjustment', 'Cond / Desir / Util')` 
            ));

        // Extract Grade and Condition from the separate elements query result
        let grade: string | null = null;
        let condition: string | null = null;

        if (elementsResult && elementsResult.length > 0) {
             grade = elementsResult.find(el => el.typeDscr === 'Grade Adjustment')?.categoryDscr ?? null;
             condition = elementsResult.find(el => el.typeDscr === 'Cond / Desir / Util')?.categoryDscr ?? null; 
        }

        // Construct the final SubjectProperty object
        const subject: SubjectProperty = {
            ...baseProperty, // Spread the base property data
            grade: grade,
            condition: condition
        };

        console.log("[getPropertyByAcct] Final subject object (separate queries):", subject);
        return subject;

    } catch (error) {
        console.error(`Error fetching property with account ${acct}:`, error);
        return null; 
    }
}

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
        // 1. Fetch the subject property
        const subjectProperty = await getPropertyByAcct(subjectAcct);
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
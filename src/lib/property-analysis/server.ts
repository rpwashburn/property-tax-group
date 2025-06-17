"use server"

import type { AdjustedComparable, SubjectProperty } from '@/lib/comparables/types';
import { searchProperties } from '@/lib/comparables/server';
import { calculateAdjustments } from '@/lib/comparables/calculations';
import type { PropertySearchCriteria } from '@/lib/comparables/types';

/**
 * Fetches comparables and calculates adjustments for a given property
 * @deprecated Use fetchAndAdjustComparables from @/lib/comparables/server instead
 */
export async function fetchComparablesWithAdjustments(
  subjectProperty: SubjectProperty,
  searchCriteria: PropertySearchCriteria
): Promise<AdjustedComparable[]> {
  try {
    console.log('Fetching comparables with criteria:', searchCriteria);
    
    // Use the existing searchProperties function from comparables/server
    const comparables = await searchProperties(searchCriteria, 50, subjectProperty.acct);
    console.log(`Found ${comparables.length} raw comparables`);
    
    // Calculate adjustments for each comparable
    const adjustedComparables: AdjustedComparable[] = comparables.map(comp => ({
      ...comp,
      adjustments: calculateAdjustments(subjectProperty, comp)
    }));

    console.log(`Calculated adjustments for ${adjustedComparables.length} comparables`);
    return adjustedComparables;
  } catch (error) {
    console.error('Error fetching comparables with adjustments:', error);
    throw error;
  }
} 
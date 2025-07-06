import { safeParseInt } from '@/lib/comparables/calculations';
import type { SubjectProperty, AdjustedComparable, ComparableFromAPI } from "@/lib/comparables/types";
import type { PropertySearchCriteria } from '@/lib/comparables/types';
import type { AdjustmentCalculations } from '@/lib/comparables/calculations';

export interface ComparableData {
  groupedComparables: GroupedComparables;
  groupMembershipIds: GroupMembershipIds;
  finalComparables: AdjustedComparable[];
}

// Define interfaces locally since we're not using the imported ones
interface GroupedComparables {
  closestByAge: AdjustedComparable[];
  closestBySqFt: AdjustedComparable[];
  lowestByValue: AdjustedComparable[];
}

interface GroupMembershipIds {
  closestByAgeIds: Set<string>;
  closestBySqFtIds: Set<string>;
  lowestByValueIds: Set<string>;
}

/**
 * Gets the top 5 comparables with the lowest adjusted values
 */
function getLowestValueComparables(comparables: AdjustedComparable[]): AdjustedComparable[] {
  return [...comparables]
    .sort((a, b) => {
      const valA = a.adjustments?.totalAdjustedValue ?? Infinity;
      const valB = b.adjustments?.totalAdjustedValue ?? Infinity;
      return valA - valB;
    })
    .slice(0, 5);
}

/**
 * Gets all comparables within +/- 10 years of the subject property
 */
function getClosestByAgeComparables(
  subjectProperty: SubjectProperty,
  comparables: AdjustedComparable[]
): AdjustedComparable[] {
  const subjYrImpr = safeParseInt(subjectProperty.yrImpr);
  
  return [...comparables]
    .filter(comp => {
      const compYear = safeParseInt(comp.yrImpr);
      const ageDiff = Math.abs(compYear - subjYrImpr);
      return ageDiff <= 10;
    })
    .sort((a, b) => {
      const ageDiffA = Math.abs(safeParseInt(a.yrImpr) - subjYrImpr);
      const ageDiffB = Math.abs(safeParseInt(b.yrImpr) - subjYrImpr);
      return ageDiffA - ageDiffB;
    });
}

/**
 * Gets all comparables within an explicit square footage range of the subject property
 * Uses tiered ranges: ≤1500 (±150), 1500-2500 (±300), 2500-3500 (±450), >3500 (no limit)
 */
function getClosestBySquareFootageComparables(
  subjectProperty: SubjectProperty,
  comparables: AdjustedComparable[]
): AdjustedComparable[] {
  const subjBldAr = safeParseInt(subjectProperty.bldAr);
  
  // Calculate explicit range based on property size tiers
  const calculateSqFtRange = (subjectSqFt: number): number => {
    if (subjectSqFt <= 1500) {
      return 150;
    } else if (subjectSqFt <= 2500) {
      return 300;
    } else if (subjectSqFt <= 3500) {
      return 450;
    } else {
      return Infinity; // No limit for properties > 3500 sqft
    }
  };
  
  const allowedRange = calculateSqFtRange(subjBldAr);
  
  return [...comparables]
    .filter(comp => {
      // If range is Infinity (>3500 sqft), include all comparables
      if (allowedRange === Infinity) {
        return true;
      }
      
      const compSqFt = safeParseInt(comp.bldAr);
      const sqFtDiff = Math.abs(compSqFt - subjBldAr);
      return sqFtDiff <= allowedRange;
    })
    .sort((a, b) => {
      const sqFtDiffA = Math.abs(safeParseInt(a.bldAr) - subjBldAr);
      const sqFtDiffB = Math.abs(safeParseInt(b.bldAr) - subjBldAr);
      return sqFtDiffA - sqFtDiffB;
    });
}

/**
 * Deduplicates a list of comparables by their ID
 */
function deduplicateComparables(comparables: AdjustedComparable[]): AdjustedComparable[] {
  const uniqueComps = new Map<string, AdjustedComparable>();
  comparables.forEach(comp => uniqueComps.set(comp.id, comp));
  return Array.from(uniqueComps.values());
}

/**
 * Creates grouped comparables from filtered lists
 */
function createGroupedComparables(
  closestByAge: AdjustedComparable[],
  closestBySqFt: AdjustedComparable[],
  lowestByValue: AdjustedComparable[]
): GroupedComparables {
  return {
    closestByAge,
    closestBySqFt,
    lowestByValue
  };
}

/**
 * Creates group membership IDs from filtered lists
 */
function createGroupMembershipIds(
  closestByAge: AdjustedComparable[],
  closestBySqFt: AdjustedComparable[],
  lowestByValue: AdjustedComparable[]
): GroupMembershipIds {
  return {
    closestByAgeIds: new Set(closestByAge.map(comp => comp.id)),
    closestBySqFtIds: new Set(closestBySqFt.map(comp => comp.id)),
    lowestByValueIds: new Set(lowestByValue.map(comp => comp.id))
  };
}

/**
 * Stub implementation for fetching comparables from API
 * TODO: Implement with actual backend API call
 */
async function fetchComparablesFromAPI(
  effectiveSubjectProperty: SubjectProperty
): Promise<AdjustedComparable[]> {
  console.warn('[comparable-service] fetchComparablesFromAPI is temporarily disabled - property data moved to backend API');
  console.warn('[comparable-service] Please implement this functionality in your backend API');
  return []; // Return empty array temporarily
}

/**
 * Fetches and processes comparable properties for analysis using the new backend API
 */
export async function fetchAndProcessComparables(
  effectiveSubjectProperty: SubjectProperty
): Promise<ComparableData> {
  // Step 1: Get all adjusted comparables from the new API
  const allAdjustedComparables = await fetchComparablesFromAPI(effectiveSubjectProperty);
  
  if (!allAdjustedComparables || allAdjustedComparables.length === 0) {
    throw new Error('No initial comparable data found to analyze.');
  }

  // Step 3: Get top 5 lowest value comparables (for grouping display)
  const lowestValueComparables = getLowestValueComparables(allAdjustedComparables);
  
  // Step 4: Get closest comparables by age and square footage from original list (for grouping display)
  const closestByAge = getClosestByAgeComparables(effectiveSubjectProperty, allAdjustedComparables);
  const closestBySqFt = getClosestBySquareFootageComparables(effectiveSubjectProperty, allAdjustedComparables);
  
  // Step 5: Create grouped comparables structure (for display in Grouped Comparables tab)
  const groupedComparables = createGroupedComparables(closestByAge, closestBySqFt, lowestValueComparables);
  const groupMembershipIds = createGroupMembershipIds(closestByAge, closestBySqFt, lowestValueComparables);

  // Step 6: Combine and deduplicate the groups to get quality comparables
  const allGroupedComparables = [
    ...closestByAge,
    ...closestBySqFt,
    ...lowestValueComparables
  ];
  const deduplicatedComparables = deduplicateComparables(allGroupedComparables);
  
  if (deduplicatedComparables.length === 0) {
    throw new Error('No relevant comparables found after grouping.');
  }

  // Step 7: Intelligently select final comparables using score and value criteria
  const finalComparables = selectIntelligentComparables(deduplicatedComparables, 3, 15);
  
  if (finalComparables.length === 0) {
    throw new Error('No comparables found with valid comparable scores after grouping.');
  }

  return {
    groupedComparables,
    groupMembershipIds,
    finalComparables
  };
}

/**
 * Applies overrides to subject property
 */
export function applySubjectPropertyOverrides(
  subjectProperty: SubjectProperty,
  overrides?: { bldAr?: string; yrImpr?: string }
): SubjectProperty {
  return {
    ...subjectProperty,
    ...(overrides?.bldAr && { bldAr: overrides.bldAr }),
    ...(overrides?.yrImpr && { yrImpr: overrides.yrImpr }),
  };
}

/**
 * Intelligently selects comparable properties based on score and value criteria
 * 1. Finds at least minCount comparables (default 3)
 * 2. Expands set by including lower-value properties within score threshold
 * @param comparables - Array of comparable properties with scores
 * @param minCount - Minimum number of comparables to include (default 3)
 * @param scoreThresholdPercent - Percentage threshold for score proximity (default 15%)
 * @returns Selected comparable properties
 */
function selectIntelligentComparables(
  comparables: AdjustedComparable[], 
  minCount: number = 3,
  scoreThresholdPercent: number = 15
): AdjustedComparable[] {
  // Filter and sort by score (highest first)
  const scoredComparables = comparables
    .filter(comp => comp.adjustments?.comparableScore !== undefined && comp.adjustments?.comparableScore !== null)
    .sort((a, b) => {
      const scoreA = a.adjustments?.comparableScore || 0;
      const scoreB = b.adjustments?.comparableScore || 0;
      return scoreB - scoreA; // Descending order (highest scores first)
    });

  if (scoredComparables.length < minCount) {
    // If we don't have enough comparables with scores, return what we have
    return scoredComparables;
  }

  // Step 1: Get the initial set (top minCount by score)
  const initialSet = scoredComparables.slice(0, minCount);
  const lowestInitialScore = initialSet[initialSet.length - 1].adjustments?.comparableScore || 0;
  
  // Calculate score threshold (percentage below the lowest score in initial set)
  const scoreThreshold = lowestInitialScore * (1 - scoreThresholdPercent / 100);
  
  // Step 2: Find the highest adjusted value in the initial set
  const highestInitialAdjustedValue = Math.max(
    ...initialSet.map(comp => comp.adjustments?.totalAdjustedValue || 0)
  );

  // Step 3: Check remaining comparables for inclusion
  const remainingComparables = scoredComparables.slice(minCount);
  const additionalComparables: AdjustedComparable[] = [];

  for (const comp of remainingComparables) {
    const score = comp.adjustments?.comparableScore || 0;
    const adjustedValue = comp.adjustments?.totalAdjustedValue || 0;
    
    // Include if score is within threshold AND adjusted value is lower than highest in initial set
    if (score >= scoreThreshold && adjustedValue < highestInitialAdjustedValue) {
      additionalComparables.push(comp);
    }
    // Stop checking if score falls too far below threshold
    else if (score < scoreThreshold) {
      break; // Since list is sorted by score, no point checking further
    }
  }

  // Combine initial set with additional qualifying comparables
  const finalSet = [...initialSet, ...additionalComparables];
  
  console.log(`[selectIntelligentComparables] Selected ${finalSet.length} comparables:`);
  console.log(`- Initial set: ${minCount} (top scores)`);
  console.log(`- Additional: ${additionalComparables.length} (within ${scoreThresholdPercent}% of ${lowestInitialScore.toFixed(2)} and lower than highest initial value)`);
  console.log(`- Score threshold: ${scoreThreshold.toFixed(2)} (based on lowest initial score: ${lowestInitialScore.toFixed(2)})`);
  console.log(`- Highest initial adjusted value: $${highestInitialAdjustedValue.toLocaleString()}`);

  return finalSet;
} 
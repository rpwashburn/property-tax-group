import { safeParseInt } from '@/lib/comparables/calculations';
import { getAdjustedComparablesForReport } from '../server';
import type { SubjectProperty, AdjustedComparable } from "@/lib/property-analysis/types";

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
 * Gets the top 5 comparables closest to subject property by age
 */
function getClosestByAgeComparables(
  subjectProperty: SubjectProperty,
  comparables: AdjustedComparable[]
): AdjustedComparable[] {
  const subjYrImpr = safeParseInt(subjectProperty.yrImpr);
  
  return [...comparables]
    .sort((a, b) => {
      const ageDiffA = Math.abs(safeParseInt(a.yrImpr) - subjYrImpr);
      const ageDiffB = Math.abs(safeParseInt(b.yrImpr) - subjYrImpr);
      return ageDiffA - ageDiffB;
    })
    .slice(0, 5);
}

/**
 * Gets the top 5 comparables closest to subject property by square footage
 */
function getClosestBySquareFootageComparables(
  subjectProperty: SubjectProperty,
  comparables: AdjustedComparable[]
): AdjustedComparable[] {
  const subjBldAr = safeParseInt(subjectProperty.bldAr);
  
  return [...comparables]
    .sort((a, b) => {
      const sqFtDiffA = Math.abs(safeParseInt(a.bldAr) - subjBldAr);
      const sqFtDiffB = Math.abs(safeParseInt(b.bldAr) - subjBldAr);
      return sqFtDiffA - sqFtDiffB;
    })
    .slice(0, 5);
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
 * Fetches and processes comparable properties for analysis
 */
export async function fetchAndProcessComparables(
  effectiveSubjectProperty: SubjectProperty
): Promise<ComparableData> {
  // Step 1: Get all adjusted comparables
  const allAdjustedComparables = await getAdjustedComparablesForReport(effectiveSubjectProperty);
  
  if (!allAdjustedComparables || allAdjustedComparables.length === 0) {
    throw new Error('No initial comparable data found to analyze.');
  }

  // Step 2: Get top 5 lowest value comparables
  const lowestValueComparables = getLowestValueComparables(allAdjustedComparables);
  
  // Step 3: Get closest comparables by age and square footage from original list
  const closestByAge = getClosestByAgeComparables(effectiveSubjectProperty, allAdjustedComparables);
  const closestBySqFt = getClosestBySquareFootageComparables(effectiveSubjectProperty, allAdjustedComparables);
  
  // Step 4: Create grouped comparables structure
  const groupedComparables = createGroupedComparables(closestByAge, closestBySqFt, lowestValueComparables);
  const groupMembershipIds = createGroupMembershipIds(closestByAge, closestBySqFt, lowestValueComparables);

  // Step 5: Deduplicate the final list from all groups
  const allGroupedComparables = [
    ...closestByAge,
    ...closestBySqFt,
    ...lowestValueComparables
  ];
  const finalComparables = deduplicateComparables(allGroupedComparables);
  
  if (finalComparables.length === 0) {
    throw new Error('No relevant comparables found after grouping.');
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
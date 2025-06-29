import { 
    calculateMedianAdjustedValue, 
    getGroupMembershipIds,
    type MedianCalculationResult, 
    type GroupMembershipIds
} from "@/lib/comparables/calculations";
// Import the server functions
import { fetchAndAdjustComparables } from "@/lib/comparables/server"; 
import { getSubjectProperty } from "@/lib/property-analysis/services/property-service";
// Import types directly from types.ts
import type { PropertySearchCriteria, SubjectProperty, AdjustedComparable } from "@/lib/comparables/types";
import { ComparablesView } from "./ComparablesView"; 
// Update import for SubjectProperty from comparables/server, and other types from property-analysis/types

interface ComparablesDataFetcherProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function ComparablesDataFetcher({ searchParams }: ComparablesDataFetcherProps) {
  const resolvedSearchParams = await searchParams;
  console.log("[Fetcher] Resolved searchParams:", resolvedSearchParams);

  const subjectAcctNumber = resolvedSearchParams?.subjectAcct as string | undefined;
  // Fetch subject property separately IF needed for median calculation or other view logic
  const subjectProperty: SubjectProperty | null = subjectAcctNumber ? await getSubjectProperty(subjectAcctNumber) : null;
  console.log("[Fetcher] Fetched Subject Property:", subjectProperty?.acct);

  // Determine filters (same logic as before)
  let applyNeighborhoodFilter = false;
  if (resolvedSearchParams?.sameNeighborhood === 'on' || (resolvedSearchParams?.sameNeighborhood === undefined && subjectAcctNumber)) {
    applyNeighborhoodFilter = true;
  }
  const filterGrade = resolvedSearchParams?.grade as string | undefined ?? subjectProperty?.grade ?? undefined;
  const filterCondition = resolvedSearchParams?.condition as string | undefined ?? subjectProperty?.condition ?? undefined;

  // Build search criteria (same logic as before)
  const criteria: PropertySearchCriteria = {
    address: resolvedSearchParams?.address as string | undefined,
    minSqft: resolvedSearchParams?.minSqft ? parseInt(resolvedSearchParams.minSqft as string) : undefined,
    maxSqft: resolvedSearchParams?.maxSqft ? parseInt(resolvedSearchParams.maxSqft as string) : undefined,
    minYearBuilt: resolvedSearchParams?.minYearBuilt ? parseInt(resolvedSearchParams.minYearBuilt as string) : undefined,
    maxYearBuilt: resolvedSearchParams?.maxYearBuilt ? parseInt(resolvedSearchParams.maxYearBuilt as string) : undefined,
    neighborhoodCode: applyNeighborhoodFilter && subjectProperty?.neighborhoodCode
      ? subjectProperty.neighborhoodCode
      : undefined,
    grade: filterGrade,
    condition: filterCondition,
  };
  console.log("[Fetcher] Final Search Criteria:", criteria);

  // Use the NEW centralized function to get adjusted comparables
  const propertiesWithAdjustments: AdjustedComparable[] = subjectAcctNumber 
    ? await fetchAndAdjustComparables(subjectAcctNumber, criteria, 1000) // Use a higher limit for the view
    : [];

  // Calculate median and group memberships using the results
  // Note: calculateMedianAdjustedValue might need the raw properties, not adjusted ones?
  // Let's pass the adjusted ones for now, but review calculateMedianAdjustedValue if needed.
  const medianResult: MedianCalculationResult = calculateMedianAdjustedValue(subjectProperty, propertiesWithAdjustments);
  console.log("[Fetcher] Calculated Median Result:", medianResult);

  // Calculate grouped comparables (if still needed)
  // const groupedComparables = getGroupedComparables(subjectProperty, propertiesWithAdjustments);

  // Get Group Membership IDs
  const groupMembershipIds: GroupMembershipIds = getGroupMembershipIds(subjectProperty, propertiesWithAdjustments);

  // Pass data to the client component
  return (
    <ComparablesView 
      initialProperties={propertiesWithAdjustments} // Pass AdjustedComparable[]
      initialCriteria={criteria} 
      subjectProperty={subjectProperty} // Still needed for display/median
      medianResult={medianResult} 
      groupMembershipIds={groupMembershipIds}
    />
  );
} 
import type { ComparablesSearchCriteria } from './types'
import type { ApiPropertyResponse } from '@/lib/properties'
// import { extractGradeAndCondition } from '@/lib/property-analysis/utils/property-utils'

/**
 * Extract search criteria from property data
 * @param propertyData - The property data object from the API
 * @param accountId - The account ID
 * @returns ComparablesSearchCriteria
 */
export function extractSearchCriteriaFromProperty(
  propertyData: ApiPropertyResponse,
  accountId: string
): ComparablesSearchCriteria {
  // Derive condition directly from primary building if available; fall back to 'C'
  const primaryBuilding = propertyData.buildings?.[0]
  const condition = primaryBuilding?.buildingCondition || 'C'

  return {
    subject_account_id: accountId,
    state_class: propertyData.classification?.stateClass || "A1",
    neighborhood_code: propertyData.classification?.neighborhoodCode || "",
    quality_condition: condition || "C"
  }
} 
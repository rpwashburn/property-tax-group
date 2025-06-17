import { ComparablesSearchCriteria } from './types'

/**
 * Extract search criteria from property data
 * @param propertyData - The property data object
 * @param accountId - The account ID
 * @returns ComparablesSearchCriteria
 */
export function extractSearchCriteriaFromProperty(
  propertyData: any,
  accountId: string
): ComparablesSearchCriteria {
  return {
    subject_account_id: accountId,
    state_class: propertyData.classification?.stateClassCode || "A1",
    neighborhood_code: propertyData.classification?.neighborhoodCode || "",
    quality_condition: propertyData.buildings?.[0]?.qualityCode || "C"
  }
} 
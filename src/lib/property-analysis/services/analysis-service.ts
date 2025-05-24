import yaml from "js-yaml"
import type { 
  AnalysisData, 
  ParseAnalysisResult, 
  MedianAssessmentResult,
  ExcludedProperty
} from "@/lib/property-analysis/types/analysis-types"
import type { SubjectProperty } from "@/lib/property-analysis/types"
import type { Comparable } from "@/lib/comparables/types"

/**
 * Calculates median assessment value from AI-selected comparable properties
 */
export function calculateMedianAssessment(
  parsedData: AnalysisData | null,
  subjectProperty?: { totMktVal?: string | null; totApprVal?: string | null }
): MedianAssessmentResult | null {
  if (!parsedData?.top_comps || parsedData.top_comps.length === 0) {
    return null
  }

  const parseMarketValue = (value: string | null | undefined): number => {
    if (!value) return 0
    // Remove all non-numeric characters (except decimal point if needed)
    return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0
  }

  const adjustedValues = parsedData.top_comps
    .map(comp => parseMarketValue(comp.adjusted_value))
    .filter(val => val > 0) // Filter out invalid or zero values
    .sort((a, b) => a - b)

  if (adjustedValues.length === 0) {
    return null
  }

  let medianValue: number
  const mid = Math.floor(adjustedValues.length / 2)
  if (adjustedValues.length % 2 === 0) {
    medianValue = (adjustedValues[mid - 1] + adjustedValues[mid]) / 2
  } else {
    medianValue = adjustedValues[mid]
  }

  const marketValue = subjectProperty?.totMktVal ? parseMarketValue(subjectProperty.totMktVal) : 0
  const appraisedValue = subjectProperty?.totApprVal ? parseMarketValue(subjectProperty.totApprVal) : 0
  const potentialSavings = appraisedValue > medianValue ? appraisedValue - medianValue : 0
  const percentageDifference = appraisedValue > 0 ? ((appraisedValue - medianValue) / medianValue) * 100 : 0

  return {
    medianValue,
    currentValue: appraisedValue,
    marketValue,
    appraisedValue,
    potentialSavings,
    percentageDifference,
    minValue: adjustedValues[0],
    maxValue: adjustedValues[adjustedValues.length - 1],
    comparableCount: adjustedValues.length
  }
}

/**
 * Parses and validates AI analysis YAML response
 */
export function parseAndValidateAnalysis(
  yamlString: string,
  subjectProperty: SubjectProperty
): ParseAnalysisResult {
  try {
    // Parse YAML
    const rawData = yaml.load(yamlString) as Record<string, unknown>

    if (!rawData || typeof rawData !== 'object') {
      return {
        success: false,
        error: "Invalid YAML structure: expected object"
      }
    }

    // Validate required fields
    if (!rawData.top_comps || !Array.isArray(rawData.top_comps)) {
      return {
        success: false,
        error: "Missing or invalid 'top_comps' field"
      }
    }

    // Clean and validate top_comps
    const cleanedTopComps = cleanComparables(rawData.top_comps, subjectProperty.acct)
    
    // Clean and validate excluded (if present)
    const cleanedExcluded = rawData.excluded 
      ? cleanExcluded(rawData.excluded as unknown[], subjectProperty.acct)
      : []

    const cleanedData: AnalysisData = {
      top_comps: cleanedTopComps,
      excluded: cleanedExcluded
    }

    return {
      success: true,
      data: cleanedData
    }

  } catch (error) {
    console.error("Error parsing YAML:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown parsing error"
    }
  }
}

/**
 * Cleans and validates comparable properties
 */
function cleanComparables(comps: unknown[], subjectAccountId: string): Comparable[] {
  if (!Array.isArray(comps)) {
    return []
  }

  const seenAccounts = new Set<string>()
  const cleanedComps: Comparable[] = []

  for (const comp of comps) {
    // Skip if missing required fields or not an object
    if (!comp || typeof comp !== 'object' || comp === null) {
      console.warn("Skipping comparable with invalid structure:", comp)
      continue
    }

    const compObj = comp as Record<string, unknown>
    
    // Validate required fields for Comparable interface
    if (!compObj.acct || !compObj.address || typeof compObj.acct !== 'string' || typeof compObj.address !== 'string') {
      console.warn("Skipping comparable with missing required fields:", comp)
      continue
    }

    // Skip if it's the subject property
    if (compObj.acct === subjectAccountId) {
      console.warn("Skipping subject property from comparables:", compObj.acct)
      continue
    }

    // Skip if we've already seen this account
    if (seenAccounts.has(compObj.acct)) {
      console.warn("Skipping duplicate account:", compObj.acct)
      continue
    }

    // Construct a valid Comparable object with all required properties
    const comparable: Comparable = {
      rank: typeof compObj.rank === 'number' ? compObj.rank : 0,
      acct: compObj.acct,
      address: compObj.address,
      adjusted_value: typeof compObj.adjusted_value === 'string' ? compObj.adjusted_value : '',
      adjusted_psf: typeof compObj.adjusted_psf === 'string' ? compObj.adjusted_psf : '',
      rationale: typeof compObj.rationale === 'string' ? compObj.rationale : ''
    }

    // Add to our tracking and results
    seenAccounts.add(compObj.acct)
    cleanedComps.push(comparable)
  }

  return cleanedComps
}

/**
 * Cleans and validates excluded properties
 */
function cleanExcluded(excluded: unknown[], subjectAccountId: string): ExcludedProperty[] {
  if (!Array.isArray(excluded)) {
    return []
  }

  const seenAccounts = new Set<string>()
  const cleanedExcluded: ExcludedProperty[] = []

  for (const item of excluded) {
    // Skip if missing required fields or not an object
    if (!item || typeof item !== 'object' || item === null) {
      console.warn("Skipping excluded item with invalid structure:", item)
      continue
    }

    const itemObj = item as Record<string, unknown>
    
    if (!itemObj.acct || !itemObj.note || typeof itemObj.acct !== 'string' || typeof itemObj.note !== 'string') {
      console.warn("Skipping excluded item with missing required fields:", item)
      continue
    }

    // Skip if it's the subject property
    if (itemObj.acct === subjectAccountId) {
      console.warn("Skipping subject property from excluded:", itemObj.acct)
      continue
    }

    // Skip if we've already seen this account
    if (seenAccounts.has(itemObj.acct)) {
      console.warn("Skipping duplicate excluded account:", itemObj.acct)
      continue
    }

    // Construct a valid ExcludedProperty object
    const excludedProperty: ExcludedProperty = {
      acct: itemObj.acct,
      note: itemObj.note
    }

    // Add to our tracking and results
    seenAccounts.add(itemObj.acct)
    cleanedExcluded.push(excludedProperty)
  }

  return cleanedExcluded
}

/**
 * Validates that the analysis has meaningful results
 */
export function validateAnalysisResults(data: AnalysisData): { isValid: boolean; message?: string } {
  if (!data.top_comps || data.top_comps.length === 0) {
    return {
      isValid: false,
      message: "No valid comparable properties found in analysis"
    }
  }

  if (data.top_comps.length < 3) {
    return {
      isValid: false,
      message: `Only ${data.top_comps.length} comparable properties found. Need at least 3 for reliable analysis.`
    }
  }

  return { isValid: true }
} 
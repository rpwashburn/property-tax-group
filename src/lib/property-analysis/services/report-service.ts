import type { EnrichedPropertyData } from "@/lib/property-analysis/types/index"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData, ExcludedProperty } from "@/lib/property-analysis/types/analysis-types"
import type { Comparable } from "@/lib/comparables/types"
import type { Deduction, EvidenceFile as DeductionEvidenceFile, QuoteFile as DeductionQuoteFile } from "@/lib/property-analysis/types/deduction-types"
import { deductionTypes as allDeductionTypes } from "@/lib/property-analysis/types/deduction-types"
import type { ExtraFeaturesDisputeSummary } from "@/lib/property-analysis/types/extra-features-types"

export interface ReportData {
  accountNumber: string
  propertyData: EnrichedPropertyData
  overrides?: OverrideState | null
  aiAnalysisData?: AnalysisData | null
  additionalDeductions?: Deduction[]
  extraFeatureDisputes?: ExtraFeaturesDisputeSummary
}

/**
 * Generates the text content for a property tax protest report
 */
export function generateReportContent(data: ReportData): string {
  const { accountNumber, propertyData, overrides, aiAnalysisData, additionalDeductions = [], extraFeatureDisputes } = data

  let reportContent = `Property Tax Protest Report\n`
  reportContent += `=================================\n\n`
  reportContent += `Account Number: ${accountNumber}\n`
  reportContent += `Property Address: ${propertyData.siteAddr1 || 'N/A'}\n`
  reportContent += `Original Total Market Value: $${parseInt(propertyData.totMktVal || "0").toLocaleString()}\n`
  reportContent += `\n--- Subject Property Details (Original) ---\n`
  reportContent += `Year Built: ${propertyData.yrImpr || 'N/A'}\n`
  reportContent += `Building Area (SqFt): ${propertyData.bldAr ? parseInt(propertyData.bldAr).toLocaleString() : 'N/A'}\n`
  reportContent += `Land Area (Acres): ${propertyData.landAr}\n`
  reportContent += `Neighborhood Code: ${propertyData.neighborhoodCode}\n`
  reportContent += `\n`

  // Add overridden property details section
  reportContent += generateOverrideSection(overrides, propertyData)

  // Add AI comparables analysis section
  reportContent += generateAIAnalysisSection(aiAnalysisData)

  // Add extra features disputes section
  reportContent += generateExtraFeaturesSection(extraFeatureDisputes)

  // Add additional deductions section
  reportContent += generateDeductionsSection(additionalDeductions)

  // Add final value calculation section
  reportContent += generateFinalValueSection(data)

  reportContent += `\n\n--- End of Report ---\n`

  return reportContent
}

/**
 * Generates the override section of the report
 */
function generateOverrideSection(overrides: OverrideState | null | undefined, propertyData: EnrichedPropertyData): string {
  if (!overrides) {
    return `--- Overridden Property Details ---\n\n`
  }

  let section = `--- Overridden Property Details ---\n`
  let hasOverrides = false

  if (overrides.yearBuilt.value && overrides.yearBuilt.value !== (propertyData.yrImpr || '')) {
    section += `Overridden Year Built: ${overrides.yearBuilt.value}`
    if (overrides.yearBuilt.fileName) section += ` (Evidence: ${overrides.yearBuilt.fileName})`
    section += `\n`
    hasOverrides = true
  }

  if (overrides.buildingSqFt.value && overrides.buildingSqFt.value !== (propertyData.bldAr || '')) {
    section += `Overridden Building SqFt: ${overrides.buildingSqFt.value}`
    if (overrides.buildingSqFt.fileName) section += ` (Evidence: ${overrides.buildingSqFt.fileName})`
    section += `\n`
    hasOverrides = true
  }

  if (!hasOverrides) {
    section += `No property details were overridden.\n`
  }

  section += `\n`
  return section
}

/**
 * Generates the AI analysis section of the report
 */
function generateAIAnalysisSection(aiAnalysisData: AnalysisData | null | undefined): string {
  let section = `--- AI Comparables Analysis ---\n`

  if (!aiAnalysisData) {
    section += `No AI analysis data available.\n\n`
    return section
  }

  // Top comparable properties
  if (aiAnalysisData.top_comps && aiAnalysisData.top_comps.length > 0) {
    section += `Top Comparable Properties:\n`
    aiAnalysisData.top_comps.forEach((comp: Comparable, index: number) => {
      const adjustedValue = comp.adjusted_value || 'N/A'
      const adjustedPsf = comp.adjusted_psf || 'N/A'
      section += `  ${index + 1}. Account: ${comp.acct}\n`
      section += `     Address: ${comp.address}\n`
      section += `     Adjusted Value: ${adjustedValue}\n`
      section += `     Adjusted PSF: ${adjustedPsf}\n`
      section += `     Rank: ${comp.rank || 'N/A'}\n`
      section += `     Rationale: ${comp.rationale || 'N/A'}\n\n`
    })
  } else {
    section += `No comparable properties found.\n\n`
  }

  // Excluded properties
  if (aiAnalysisData.excluded && aiAnalysisData.excluded.length > 0) {
    section += `Excluded Properties:\n`
    aiAnalysisData.excluded.forEach((ex: ExcludedProperty) => {
      section += `  Account: ${ex.acct} - Note: ${ex.note}\n`
    })
    section += `\n`
  }

  return section
}

/**
 * Generates the extra features section of the report
 */
function generateExtraFeaturesSection(extraFeatureDisputes: ExtraFeaturesDisputeSummary | undefined): string {
  let section = `--- Extra Features Review ---\n`
  
  if (!extraFeatureDisputes) {
    section += `No extra features were disputed.\n\n`
    return section
  }
  
  section += `Total Extra Features Value: $${extraFeatureDisputes.totalOriginalValue.toLocaleString()}\n`
  
  const disputedFeatures = extraFeatureDisputes.disputes.filter(dispute => dispute.disputed)
  
  if (disputedFeatures.length > 0) {
    section += `\nDisputed Extra Features (${disputedFeatures.length}):\n`
    disputedFeatures.forEach((dispute, index) => {
      const originalValue = Number(dispute.originalValue);
      const disputedValue = Number(dispute.disputedValue);
      const reduction = originalValue - disputedValue;
      
      section += `${index + 1}. ${dispute.description}\n`
      section += `   Type: ${dispute.type}\n`
      section += `   Assessed Value: $${originalValue.toLocaleString()}\n`
      section += `   Your Estimated Fair Value: $${disputedValue.toLocaleString()}\n`
      section += `   Value Reduction: $${reduction.toLocaleString()}\n`
      section += `   Dispute Reason: ${dispute.reason}\n`
      if (dispute.evidenceFiles.length > 0) {
        section += `   Supporting Evidence: ${dispute.evidenceFiles.length} file${dispute.evidenceFiles.length !== 1 ? 's' : ''} provided\n`
      }
      section += `\n`
    })

    section += `Total Value Reduction: $${extraFeatureDisputes.totalValueReduction.toLocaleString()}\n`
    section += `Adjusted Extra Features Value: $${extraFeatureDisputes.adjustedExtraFeaturesValue.toLocaleString()}\n`
  } else {
    section += `No extra features were disputed.\n`
  }

  section += `\n`
  return section
}

/**
 * Generates the deductions section of the report
 */
function generateDeductionsSection(additionalDeductions: Deduction[]): string {
  let section = `--- Additional Deductions ---\n`

  if (additionalDeductions.length === 0) {
    section += `No additional deductions specified.\n`
    return section
  }

  let totalDeductionAmount = 0

  additionalDeductions.forEach((deduction, index) => {
    const deductionTypeLabel = allDeductionTypes.find(dt => dt.value === deduction.type)?.label || deduction.type
    section += `\nDeduction ${index + 1}: ${deductionTypeLabel}\n`
    section += `  Description: ${deduction.description}\n`
    section += `  Estimated Cost: $${deduction.amount.toLocaleString()}\n`
    totalDeductionAmount += deduction.amount

    if (deduction.evidence.length > 0) {
      section += `  Attached Evidence:\n`
      deduction.evidence.forEach((ev: DeductionEvidenceFile) => {
        section += `    - ${ev.name} (${ev.type})\n`
      })
    } else {
      section += `  Attached Evidence: None\n`
    }

    if (deduction.quotes.length > 0) {
      section += `  Attached Quotes:\n`
      deduction.quotes.forEach((quote: DeductionQuoteFile) => {
        section += `    - ${quote.company}: $${quote.amount.toLocaleString()} (File: ${quote.name})\n`
      })
    } else {
      section += `  Attached Quotes: None\n`
    }
  })

  section += `\nTotal Estimated Deduction Value: $${totalDeductionAmount.toLocaleString()}\n`
  return section
}

/**
 * Generates the final value calculation section
 */
function generateFinalValueSection(data: ReportData): string {
  const { propertyData, extraFeatureDisputes, additionalDeductions = [] } = data
  
  let section = `\n--- Final Value Calculation ---\n`
  
  const originalValue = Number(propertyData.totMktVal || 0)
  section += `Original Total Market Value: $${originalValue.toLocaleString()}\n`
  
  // Extra Features Adjustment
  const extraFeaturesReduction = extraFeatureDisputes ? extraFeatureDisputes.totalValueReduction : 0
  if (extraFeaturesReduction > 0) {
    section += `Extra Features Value Reduction: -$${extraFeaturesReduction.toLocaleString()}\n`
  }
  
  // Additional Deductions
  const totalDeductions = additionalDeductions.reduce((sum, deduction) => sum + deduction.amount, 0)
  if (totalDeductions > 0) {
    section += `Additional Deductions: -$${totalDeductions.toLocaleString()}\n`
  }
  
  // Calculate final value
  const finalValue = Math.max(0, originalValue - extraFeaturesReduction - totalDeductions)
  section += `\nProposed Total Market Value: $${finalValue.toLocaleString()}\n`
  
  // Calculate percentage reduction
  const percentageReduction = ((originalValue - finalValue) / originalValue) * 100
  section += `Total Value Reduction: ${percentageReduction.toFixed(1)}%\n`
  
  return section
}

/**
 * Downloads a report as a text file
 */
export function downloadReportAsText(reportContent: string, filename: string): void {
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Complete utility function to generate and download a property tax protest report
 */
export function generateAndDownloadReport(data: ReportData): void {
  const reportContent = generateReportContent(data)
  const filename = `property-report-${data.accountNumber}.txt`
  downloadReportAsText(reportContent, filename)
  console.log("Report data compiled and download initiated as TXT file.")
} 
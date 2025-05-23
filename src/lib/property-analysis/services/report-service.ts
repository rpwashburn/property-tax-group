import type { PropertyData } from "@/lib/property-analysis/types"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData, ExcludedProperty } from "@/lib/property-analysis/types/analysis-types"
import type { Comparable } from "@/lib/comparables/types"
import type { Deduction, EvidenceFile as DeductionEvidenceFile, QuoteFile as DeductionQuoteFile } from "@/lib/property-analysis/types/deduction-types"
import { deductionTypes as allDeductionTypes } from "@/lib/property-analysis/types/deduction-types"

export interface ReportData {
  accountNumber: string
  propertyData: PropertyData
  overrides?: OverrideState | null
  aiAnalysisData?: AnalysisData | null
  additionalDeductions?: Deduction[]
}

/**
 * Generates the text content for a property tax protest report
 */
export function generateReportContent(data: ReportData): string {
  const { accountNumber, propertyData, overrides, aiAnalysisData, additionalDeductions = [] } = data

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

  // Add additional deductions section
  reportContent += generateDeductionsSection(additionalDeductions)

  reportContent += `\n\n--- End of Report ---\n`

  return reportContent
}

/**
 * Generates the override section of the report
 */
function generateOverrideSection(overrides: OverrideState | null | undefined, propertyData: PropertyData): string {
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
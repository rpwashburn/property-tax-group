"use client"

import { useState } from "react"
import type { SubjectProperty } from "@/lib/property-analysis/types"
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types"

// Import individual services instead of the orchestrating action
import { 
  fetchAndProcessComparables, 
  applySubjectPropertyOverrides 
} from "@/lib/property-analysis/services/comparable-service"
import { 
  generateAnalysisPrompt, 
  formatComparablesForPrompt 
} from "@/lib/property-analysis/services/prompt-service"
import { performAIAnalysis } from "@/lib/property-analysis/services/ai-service"
import { parseAndValidateAnalysis, validateAnalysisResults } from "@/lib/property-analysis/services/analysis-service"

export interface UseAiAnalysisReturn {
  // State
  analysisResult: string | null
  parsedData: AnalysisData | null
  promptUsed: string | null
  isLoading: boolean
  error: string | null
  isComplete: boolean
  parseError: string | null
  
  // Actions
  generateAnalysis: (
    subjectProperty: SubjectProperty,
    overrides?: { bldAr?: string; yrImpr?: string }
  ) => Promise<void>
  resetAnalysis: () => void
}

export function useAiAnalysis(): UseAiAnalysisReturn {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<AnalysisData | null>(null)
  const [promptUsed, setPromptUsed] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setParsedData(null)
    setPromptUsed(null)
    setError(null)
    setIsComplete(false)
    setParseError(null)
  }

  const generateAnalysis = async (
    subjectProperty: SubjectProperty,
    overrides?: { bldAr?: string; yrImpr?: string }
  ) => {
    setIsLoading(true)
    resetAnalysis()

    try {
      // Step 1: Apply overrides to create effective subject property
      const effectiveSubjectProperty = applySubjectPropertyOverrides(subjectProperty, overrides)

      // Step 2: Fetch and process comparable properties using the effective property
      const comparableData = await fetchAndProcessComparables(effectiveSubjectProperty)

      // Step 3: Format comparables for the AI prompt
      const formattedComparables = formatComparablesForPrompt(
        comparableData.finalComparables,
        comparableData.groupMembershipIds
      )

      // Step 4: Generate the complete analysis prompt
      const prompt = generateAnalysisPrompt(effectiveSubjectProperty, formattedComparables, overrides)
      setPromptUsed(prompt)

      // Step 5: Call AI with the prompt
      const aiResult = await performAIAnalysis(prompt)

      if (aiResult.error) {
        setError(aiResult.error)
        return
      }

      if (!aiResult.analysis) {
        setError("Analysis completed but returned no content.")
        return
      }

      // Step 6: Store raw analysis result
      setAnalysisResult(aiResult.analysis)
      
      // Step 7: Parse and validate the AI response
      const parseResult = parseAndValidateAnalysis(aiResult.analysis, subjectProperty)
      
      if (!parseResult.success) {
        setParseError(parseResult.error || "Failed to parse analysis results")
        return
      }

      if (!parseResult.data) {
        setParseError("No data returned from parsing")
        return
      }

      // Step 8: Validate the analysis has meaningful results
      const validationResult = validateAnalysisResults(parseResult.data)
      
      if (!validationResult.isValid) {
        setParseError(validationResult.message || "Analysis results are not valid")
        return
      }

      // Step 9: Set the cleaned and validated data
      setParsedData(parseResult.data)
      setIsComplete(true)

    } catch (err: unknown) {
      console.error("Error during AI analysis:", err)
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`)
      } else {
        setError("An unexpected error occurred during analysis")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    analysisResult,
    parsedData,
    promptUsed,
    isLoading,
    error,
    isComplete,
    parseError,
    generateAnalysis,
    resetAnalysis,
  }
} 
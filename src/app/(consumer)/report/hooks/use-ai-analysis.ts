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
import { calculateMedianAssessment } from "@/lib/property-analysis/services/analysis-service"

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

    const MAX_RETRIES = 3
    let retryCount = 0

    while (retryCount < MAX_RETRIES) {
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

        // Step 4: Generate the complete analysis prompt with retry strategy
        const prompt = generateAnalysisPromptWithRetryStrategy(
          effectiveSubjectProperty, 
          formattedComparables, 
          overrides, 
          retryCount
        )
        setPromptUsed(prompt)

        // Step 5: Call AI with the prompt (now handles parsing internally)
        const aiResult = await performAIAnalysis(prompt, subjectProperty)

        if (aiResult.error) {
          setError(aiResult.error)
          return
        }

        if (!aiResult.analysisData) {
          setError("Analysis completed but returned no data.")
          return
        }

        // Step 6: Store raw analysis result and parsed data
        setAnalysisResult(aiResult.rawResponse || "Analysis completed successfully")
        
        // Step 7: Calculate median to check if retry is needed
        const medianData = calculateMedianAssessment(aiResult.analysisData, subjectProperty)
        
        // Step 8: Check if we need to retry (current assessment lower than recommended)
        if (medianData && medianData.potentialSavings <= 0 && retryCount < MAX_RETRIES - 1) {
          console.log(`Analysis attempt ${retryCount + 1}: Current assessment (${medianData.currentValue}) is at or below median (${medianData.medianValue}). Retrying with different strategy...`)
          retryCount++
          continue // Try again with different strategy
        }

        // Step 9: Set the cleaned and validated data and mark as complete
        setParsedData(aiResult.analysisData)
        setIsComplete(true)
        break // Success - exit retry loop

      } catch (err: unknown) {
        console.error("Error during analysis:", err)
        if (retryCount === MAX_RETRIES - 1) {
          // Final attempt failed
          setError(err instanceof Error ? err.message : "Unknown error during analysis")
          break
        }
        retryCount++
      }
    }

    setIsLoading(false)
  }

  // Helper function to modify prompt strategy based on retry attempt
  const generateAnalysisPromptWithRetryStrategy = (
    subjectProperty: SubjectProperty,
    formattedComparables: string,
    overrides?: { bldAr?: string; yrImpr?: string },
    retryCount: number = 0
  ): string => {
    // Get the base prompt
    const basePrompt = generateAnalysisPrompt(subjectProperty, formattedComparables, overrides)
    
    // Add retry-specific instructions
    if (retryCount === 0) {
      return basePrompt // First attempt - use original strategy
    } else if (retryCount === 1) {
      return basePrompt + `

⧉ **RETRY STRATEGY 1**: The previous analysis selected comparables that were too low. For this attempt, prioritize selecting comparables that are closer to the middle or upper range of the provided list. Focus on properties that would support a median value closer to or above the subject property's current assessment.`
    } else if (retryCount === 2) {
      return basePrompt + `

⧉ **RETRY STRATEGY 2**: Previous attempts selected comparables that were too low. For this final attempt, be more aggressive in selecting higher-value comparables from the provided list. Prioritize comparables that would result in a median assessment value that exceeds the subject property's current assessment, even if they are less similar in some characteristics.`
    }
    
    return basePrompt
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
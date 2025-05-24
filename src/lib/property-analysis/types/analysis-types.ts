import type { Comparable } from "@/lib/comparables/types";

// Previously local to AiAnalyzerStep.tsx
export interface ExcludedProperty {
  acct: string;
  note: string;
}

// Previously local to AiAnalyzerStep.tsx
export interface AnalysisData {
  top_comps: Comparable[];
  excluded: ExcludedProperty[];
  // Add other fields from the AI analysis YAML structure if they exist and are used
  // For example, if the YAML includes a summary or overall recommendation directly:
  // recommended_value?: string;
  // analysis_summary_text?: string;
}

export interface ParseAnalysisResult {
  success: boolean
  data?: AnalysisData
  error?: string
}

export interface MedianAssessmentResult {
  medianValue: number
  currentValue: number // Keep for backward compatibility (same as appraisedValue)
  marketValue: number
  appraisedValue: number
  potentialSavings: number
  percentageDifference: number
  minValue: number
  maxValue: number
  comparableCount: number
} 
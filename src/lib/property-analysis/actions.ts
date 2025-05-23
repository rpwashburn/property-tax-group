"use server";

import type { SubjectProperty } from "@/lib/property-analysis/types";
import { 
  fetchAndProcessComparables, 
  applySubjectPropertyOverrides 
} from './services/comparable-service';
import { 
  generateAnalysisPrompt, 
  formatComparablesForPrompt 
} from './services/prompt-service';
import { performAIAnalysis } from './services/ai-service';

export interface AnalysisResult {
  analysis?: string;
  prompt?: string;
  error?: string;
}

interface SubjectPropertyOverrides {
  bldAr?: string;
  yrImpr?: string;
}

/**
 * Main action to perform AI analysis on a subject property with optional overrides
 */
export async function performAnalysisAction(
  subjectProperty: SubjectProperty,
  overrides?: SubjectPropertyOverrides
): Promise<AnalysisResult> {
  let prompt = 'Error generating prompt.'; // Default prompt state
  
  try {
    // Step 1: Apply overrides to create effective subject property
    const effectiveSubjectProperty = applySubjectPropertyOverrides(subjectProperty, overrides);

    // Step 2: Fetch and process comparable properties using the effective property
    const comparableData = await fetchAndProcessComparables(effectiveSubjectProperty);

    // Step 3: Format comparables for the AI prompt
    const formattedComparables = formatComparablesForPrompt(
      comparableData.finalComparables,
      comparableData.groupMembershipIds
    );

    // Step 4: Generate the complete analysis prompt
    prompt = generateAnalysisPrompt(effectiveSubjectProperty, formattedComparables, overrides);

    // Step 5: Perform AI analysis
    const aiResult = await performAIAnalysis(prompt);

    if (aiResult.error) {
      return { error: aiResult.error, prompt };
    }

    return { 
      analysis: aiResult.analysis, 
      prompt 
    };

  } catch (err: unknown) {
    console.error("Error during AI Analysis Action:", err);
    let errorMessage = 'Unknown error';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    // Return error and the prompt if it was generated before the error
    return { 
      error: `Failed to perform analysis: ${errorMessage}`, 
      prompt: prompt.startsWith('\nYou are a valuation analyst') ? prompt : undefined 
    };
  }
} 
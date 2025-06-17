"use server";

import OpenAI from 'openai';
import { parseAndValidateAnalysis, validateAnalysisResults } from './analysis-service';
import type { SubjectProperty } from '@/lib/comparables/types';
import type { AnalysisData } from '@/lib/property-analysis/types/analysis-types';

const openai = new OpenAI(); // Ensure OPENAI_API_KEY is set

export interface AIAnalysisResult {
  analysisData?: AnalysisData;
  rawResponse?: string;
  error?: string;
}

/**
 * Calls OpenAI API to perform analysis based on the provided prompt
 * Now handles YAML parsing internally and retries on format errors
 */
export async function performAIAnalysis(
  prompt: string, 
  subjectProperty: SubjectProperty,
  maxRetries: number = 2
): Promise<AIAnalysisResult> {
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Modify prompt for retry attempts to be more explicit about format
      const finalPrompt = attempt === 0 ? prompt : prompt + `

⧉ **IMPORTANT**: Return ONLY valid YAML without any markdown code blocks, backticks, or extra text. Do not wrap the YAML in \`\`\`yaml or any other formatting. Start directly with "top_comps:" and end with the excluded section.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        stream: false,
        messages: [{ role: 'user', content: finalPrompt }],
      });

      const rawAnalysis = response.choices[0]?.message?.content?.trim() || '';
      
      if (!rawAnalysis) {
        if (attempt === maxRetries) {
          return { error: 'No response content received from AI after retries.' };
        }
        continue; // Retry
      }

      // Clean the response - remove markdown code blocks if present
      const cleanedAnalysis = cleanYamlResponse(rawAnalysis);
      
      // Parse and validate the AI response
      const parseResult = parseAndValidateAnalysis(cleanedAnalysis, subjectProperty);
      
      if (!parseResult.success) {
        console.log(`AI Analysis attempt ${attempt + 1} parsing failed:`, parseResult.error);
        if (attempt === maxRetries) {
          return { 
            error: `Failed to parse AI response after ${maxRetries + 1} attempts. Last error: ${parseResult.error}`,
            rawResponse: rawAnalysis 
          };
        }
        continue; // Retry with clearer format instructions
      }

      if (!parseResult.data) {
        if (attempt === maxRetries) {
          return { error: "No data returned from parsing after retries" };
        }
        continue; // Retry
      }

      // Validate the analysis has meaningful results
      const validationResult = validateAnalysisResults(parseResult.data);
      
      if (!validationResult.isValid) {
        console.log(`AI Analysis attempt ${attempt + 1} validation failed:`, validationResult.message);
        if (attempt === maxRetries) {
          return { 
            error: validationResult.message || "Analysis results are not valid after retries",
            rawResponse: rawAnalysis 
          };
        }
        continue; // Retry
      }

      // Success!
      return { 
        analysisData: parseResult.data,
        rawResponse: rawAnalysis 
      };

    } catch (err: unknown) {
      console.error(`AI Analysis attempt ${attempt + 1} error:`, err);
      if (attempt === maxRetries) {
        let errorMessage = 'Unknown error';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        return { error: `AI analysis failed after ${maxRetries + 1} attempts: ${errorMessage}` };
      }
      // Continue to retry
    }
  }

  return { error: 'Unexpected error: retry loop completed without return' };
}

/**
 * Cleans YAML response by removing markdown code blocks and extra formatting
 */
function cleanYamlResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```yaml\s*/gm, '');
  cleaned = cleaned.replace(/^```\s*/gm, '');
  cleaned = cleaned.replace(/```$/gm, '');
  
  // Remove any leading/trailing whitespace again
  cleaned = cleaned.trim();
  
  return cleaned;
} 
"use server";

import OpenAI from 'openai';

const openai = new OpenAI(); // Ensure OPENAI_API_KEY is set

export interface AIAnalysisResult {
  analysis?: string;
  error?: string;
}

/**
 * Calls OpenAI API to perform analysis based on the provided prompt
 */
export async function performAIAnalysis(prompt: string): Promise<AIAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: false,
      messages: [{ role: 'user', content: prompt }],
      // temperature: 0.7,
      // max_tokens: 1500,
    });

    const analysis = response.choices[0]?.message?.content?.trim() || 'No response content received from AI.';
    return { analysis };

  } catch (err: unknown) {
    console.error("Error during OpenAI API call:", err);
    let errorMessage = 'Unknown error';
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return { error: `AI analysis failed: ${errorMessage}` };
  }
} 
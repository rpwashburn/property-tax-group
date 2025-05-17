"use server";

import OpenAI from 'openai';
import { type SubjectProperty } from '@/lib/comparables/server';
import { getGroupedComparables, getGroupMembershipIds, type GroupedComparables, type GroupMembershipIds } from '@/lib/comparables/calculations';
import { getAdjustedComparablesForReport } from './server';
import type { MedianCalculationResult, GroupedComparables, GroupMembershipIds } from "./calculations";
import type { AnalysisResult } from "../ai/types";
import { formatCurrency } from "@/lib/utils";
import type { SubjectProperty, AdjustedComparable } from "@/lib/property-analysis/types";

const openai = new OpenAI(); // Ensure OPENAI_API_KEY is set

// Helper (can be shared or duplicated from component)
// const formatCurrency = (value: number | null | undefined) => {
//     if (value === null || value === undefined) return 'N/A';
//     return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
// }
// Removed local helper, using shared one from utils now

interface AnalysisResult {
    analysis?: string;
    prompt?: string; // Optionally return the prompt too
    error?: string;
}

// Define an interface for the overrides
interface SubjectPropertyOverrides {
    bldAr?: string;
    yrImpr?: string;
}

export async function performAnalysisAction(
    subjectProperty: SubjectProperty,
    overrides?: SubjectPropertyOverrides // Add optional overrides parameter
): Promise<AnalysisResult> {
    let prompt = 'Error generating prompt.'; // Default prompt state
    try {
        // Create an effective subject property incorporating overrides
        const effectiveSubjectProperty: SubjectProperty = {
            ...subjectProperty,
            ...(overrides?.bldAr && { bldAr: overrides.bldAr }),
            ...(overrides?.yrImpr && { yrImpr: overrides.yrImpr }),
        };

        // --- Regenerate Prompt Logic ---
        // Removed: const subjectProperty = await getPropertyByAcct(accountNumber);
        // No need to check for subjectProperty null anymore, assuming it's passed correctly

        // Fetch comparables based on the original subject property's account number
        const allAdjustedComparables = await getAdjustedComparablesForReport(subjectProperty.acct); // Fetch using original acct
        if (!allAdjustedComparables || allAdjustedComparables.length === 0) {
            throw new Error('No initial comparable data found to analyze.');
        }

        // Use the effective subject property for grouping comparables
        const groupedComparables: GroupedComparables = getGroupedComparables(effectiveSubjectProperty, allAdjustedComparables);
        const groupMembershipIds: GroupMembershipIds = getGroupMembershipIds(effectiveSubjectProperty, allAdjustedComparables);

        const uniqueGroupedComps = new Map<string, AdjustedComparable>();
        groupedComparables.closestByAge.forEach(comp => uniqueGroupedComps.set(comp.id, comp));
        groupedComparables.closestBySqFt.forEach(comp => uniqueGroupedComps.set(comp.id, comp));
        groupedComparables.lowestByValue.forEach(comp => uniqueGroupedComps.set(comp.id, comp));

        const finalComparablesForPrompt = Array.from(uniqueGroupedComps.values());
        if (finalComparablesForPrompt.length === 0) { throw new Error('No relevant comparables found after grouping.'); }

        const formattedComparablesText = finalComparablesForPrompt.map((comp, index) => {
             const groups: string[] = [];
            if (groupMembershipIds?.closestByAgeIds.has(comp.id)) groups.push('Age');
            if (groupMembershipIds?.closestBySqFtIds.has(comp.id)) groups.push('SqFt');
            if (groupMembershipIds?.lowestByValueIds.has(comp.id)) groups.push('Value');

            const adjValue = comp.adjustments?.totalAdjustedValue;
            const bldArea = comp.bldAr ? parseInt(comp.bldAr, 10) : 0;
            const adjPerSqFt = (adjValue && bldArea > 0) ? formatCurrency(adjValue / bldArea) + '/sqft' : 'N/A';

            return `${index + 1}. Account: ${comp.acct}\n` +
                   `   Address: ${comp.siteAddr1 || 'N/A'}\n` +
                   `   Groups: ${groups.join(', ') || 'None'}\n` +
                   `   Year: ${comp.yrImpr || 'N/A'}, SqFt: ${bldArea.toLocaleString()}\n` +
                   `   Adj. Value: ${formatCurrency(adjValue)} (${adjPerSqFt})\n` +
                   `   Original Mkt Value: ${formatCurrency(comp.totMktVal ? parseInt(comp.totMktVal, 10) : null)}`;
        }).join('\n---\n');

        prompt = `
You are a valuation analyst choosing the best adjusted comparable sales for a single commercial subject property.

Inputs you will receive:
  1. A Subject Property block:
     Account: ${effectiveSubjectProperty.acct}
     Address: ${effectiveSubjectProperty.siteAddr1 || 'N/A'}
     Neighborhood: ${effectiveSubjectProperty.neighborhoodCode || 'N/A'}
     Grade: ${effectiveSubjectProperty.grade || 'N/A'}
     Condition: ${effectiveSubjectProperty.condition || 'N/A'}
     Year Built: ${effectiveSubjectProperty.yrImpr || 'N/A'} ${overrides?.yrImpr ? '(Overridden)' : ''}
     Building SF: ${effectiveSubjectProperty.bldAr ? parseInt(effectiveSubjectProperty.bldAr, 10).toLocaleString() : 'N/A'} ${overrides?.bldAr ? '(Overridden)' : ''}
     Land SF: ${effectiveSubjectProperty.landAr ? parseInt(effectiveSubjectProperty.landAr, 10).toLocaleString() : 'N/A'}
     Market Value: ${formatCurrency(effectiveSubjectProperty.totMktVal ? parseInt(effectiveSubjectProperty.totMktVal, 10) : null)}

  2. The following list of pre‑filtered comparable properties. These represent the top 5 closest in age, top 5 closest in building square footage, and top 5 lowest by total adjusted value relative to the subject. Key details and group memberships are included:

${formattedComparablesText}

Deliverable: Choose the best **five** comps for a property‑tax appeal, then list the next two that were nearly chosen.
Your goal is to choose the comparables that optimize for tax savings while still being relevant to the subject property.

⧉ **Return only valid YAML** (no extra text, commentary, or Markdown).
⧉ Schema to follow exactly:

top_comps:            # exactly five items, rank ascending (1 = best)
  - rank: 1
    acct: "HCAD‑ACCOUNT"
    address: "123 Main St"
    adjusted_value: "$1,234,567"
    adjusted_psf: "$456/sqft"
    rationale: "One concise sentence."

excluded:             # exactly two items (the would‑be #6 and #7)
  - acct: "HCAD‑ACCOUNT"
    note: "One‑line reason it was not selected."
  - acct: "HCAD‑ACCOUNT"
    note: "One‑line reason it was not selected."
`;
        // --- End Prompt Generation ---

        // --- Call OpenAI API (Non-Streaming) ---
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: false,
            messages: [{ role: 'user', content: prompt }],
            // temperature: 0.7,
            // max_tokens: 1500,
        });

        const analysis = response.choices[0]?.message?.content?.trim() || 'No response content received from AI.';
        return { analysis, prompt }; // Return both analysis and prompt

    } catch (err: unknown) {
        console.error("Error during AI Analysis Action:", err);
        let errorMessage = 'Unknown error';
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        // Return error and the prompt if it was generated before the error
        // Ensure prompt is included if it was successfully generated using the passed subjectProperty
        return { error: `Failed to perform analysis: ${errorMessage}`, prompt: prompt.startsWith('\nYou are a valuation analyst') ? prompt : undefined };
    }
} 
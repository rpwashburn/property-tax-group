import { formatCurrency } from "@/lib/utils";
import type { SubjectProperty, AdjustedComparable } from "@/lib/property-analysis/types";
import type { GroupMembershipIds } from '@/lib/comparables/calculations';

/**
 * Formats comparable properties for inclusion in the AI prompt
 */
export function formatComparablesForPrompt(
  comparables: AdjustedComparable[],
  groupMembershipIds: GroupMembershipIds
): string {
  return comparables.map((comp, index) => {
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
}

/**
 * Formats subject property information for the prompt
 */
export function formatSubjectPropertyForPrompt(
  subjectProperty: SubjectProperty,
  overrides?: { bldAr?: string; yrImpr?: string }
): string {
  return `Account: ${subjectProperty.acct}
     Address: ${subjectProperty.siteAddr1 || 'N/A'}
     Neighborhood: ${subjectProperty.neighborhoodCode || 'N/A'}
     Grade: ${subjectProperty.grade || 'N/A'}
     Condition: ${subjectProperty.condition || 'N/A'}
     Year Built: ${subjectProperty.yrImpr || 'N/A'} ${overrides?.yrImpr ? '(Overridden)' : ''}
     Building SF: ${subjectProperty.bldAr ? parseInt(subjectProperty.bldAr, 10).toLocaleString() : 'N/A'} ${overrides?.bldAr ? '(Overridden)' : ''}
     Land SF: ${subjectProperty.landAr ? parseInt(subjectProperty.landAr, 10).toLocaleString() : 'N/A'}
     Market Value: ${formatCurrency(subjectProperty.totMktVal ? parseInt(subjectProperty.totMktVal, 10) : null)}`;
}

/**
 * Generates the complete AI analysis prompt
 */
export function generateAnalysisPrompt(
  subjectProperty: SubjectProperty,
  formattedComparables: string,
  overrides?: { bldAr?: string; yrImpr?: string }
): string {
  const subjectPropertyText = formatSubjectPropertyForPrompt(subjectProperty, overrides);

  return `
You are a property tax protest expert. You are given a subject property and a list of comparable properties.
You are tasked with choosing the best five comparables for a property tax appeal.
You are also tasked with choosing the next two comparables that were nearly chosen.
You are also tasked with choosing the comparables that optimize for tax savings while still being relevant to the subject property.

Inputs you will receive:
  1. A Subject Property block:
     ${subjectPropertyText}

  2. The following list of pre‑filtered comparable properties. These represent properties that are close in age and square footage to the subject property. Key details and group memberships are included:

${formattedComparables}

Deliverable: Choose the best **five** comps for a property‑tax appeal, then list the next two that were nearly chosen.
Your goal is to choose the comparables that optimize for tax savings while still being relevant to the subject property.
You need to optimize for a median value of adjusted comparables that beat ${formatCurrency(subjectProperty.totApprVal ? parseInt(subjectProperty.totApprVal, 10) : null)}.

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
} 
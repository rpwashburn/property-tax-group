import type { SubjectProperty } from "@/lib/comparables/types";
import type { EnrichedPropertyData } from '@/lib/property-analysis/types/index';

/**
 * Unified function to extract grade and condition from structural elements
 */
export function extractGradeAndCondition(structuralElements?: Array<{
  typeDscr: string;
  categoryDscr: string;
}>): { grade: string | null; condition: string | null } {
  let grade: string | null = null;
  let condition: string | null = null;

  if (structuralElements && structuralElements.length > 0) {
    grade = structuralElements.find(el => el.typeDscr === 'Grade Adjustment')?.categoryDscr ?? null;
    condition = structuralElements.find(el => el.typeDscr === 'Cond / Desir / Util')?.categoryDscr ?? null;
  }

  return { grade, condition };
}

/**
 * Converts PropertyData to SubjectProperty by extracting grade and condition
 */
export function convertPropertyDataToSubjectProperty(propertyData: EnrichedPropertyData): SubjectProperty {
  const { grade, condition } = extractGradeAndCondition(propertyData.structuralElements);

  return {
    id: propertyData.id,
    acct: propertyData.acct,
    siteAddr1: propertyData.siteAddr1,
    siteAddr3: propertyData.siteAddr3,
    stateClass: propertyData.stateClass,
    neighborhoodCode: propertyData.neighborhoodCode,
    yrImpr: propertyData.yrImpr,
    bldAr: propertyData.bldAr,
    bldVal: propertyData.bldVal,
    landAr: propertyData.landAr,
    landVal: propertyData.landVal,
    acreage: propertyData.acreage,
    totMktVal: propertyData.totMktVal,
    totApprVal: propertyData.totApprVal,
    xFeaturesVal: propertyData.xFeaturesVal,
    grade,
    condition,
  };
} 
import type { SubjectProperty } from "@/lib/comparables/types";
import type { EnrichedPropertyData, ApiPropertyResponse } from '@/lib/property-analysis/types/index';

/**
 * Transform API response to EnrichedPropertyData format for backward compatibility
 */
export function transformApiToEnriched(apiData: ApiPropertyResponse): EnrichedPropertyData {
  return {
    // Core identifiers
    id: apiData.id,
    acct: apiData.accountId,
    
    // Address fields (flattened from address object)
    strNum: apiData.address.streetNumber,
    str: apiData.address.streetName,
    strSfx: apiData.address.streetSuffix,
    strSfxDir: apiData.address.streetSuffixDirection,
    siteAddr1: apiData.address.siteAddress1,
    siteAddr2: apiData.address.siteAddress2,
    siteAddr3: apiData.address.siteAddress3,
    
    // Classification fields (flattened from classification object)
    stateClass: apiData.classification.stateClass,
    schoolDist: apiData.classification.schoolDistrict,
    neighborhoodCode: apiData.classification.neighborhoodCode,
    neighborhoodGrp: apiData.classification.neighborhoodGroup,
    neighborhoodDescription: apiData.classification.neighborhoodDescription,
    jurs: apiData.classification.jurisdiction,
    
    // Market info fields (flattened from marketInfo object)
    marketArea1: apiData.marketInfo.marketArea1,
    marketArea1Dscr: apiData.marketInfo.marketArea1Description,
    marketArea2: apiData.marketInfo.marketArea2,
    marketArea2Dscr: apiData.marketInfo.marketArea2Description,
    econArea: apiData.marketInfo.economicArea,
    econBldClass: apiData.marketInfo.economicBuildingClass,
    
    // Characteristics fields (flattened from characteristics object)
    yrImpr: apiData.characteristics.yearImproved?.toString() || null,
    yrAnnexed: apiData.characteristics.yearAnnexed?.toString() || null,
    bldAr: apiData.characteristics.buildingArea,
    landAr: apiData.characteristics.landArea,
    acreage: apiData.characteristics.acreage,
    
    // Current values (flattened from currentValues object)
    landVal: apiData.currentValues.landValue,
    bldVal: apiData.currentValues.buildingValue,
    xFeaturesVal: apiData.currentValues.extraFeaturesValue,
    agVal: apiData.currentValues.agriculturalValue,
    assessedVal: apiData.currentValues.assessedValue,
    totApprVal: apiData.currentValues.totalAppraisedValue,
    totMktVal: apiData.currentValues.totalMarketValue,
    newConstructionVal: apiData.currentValues.newConstructionValue,
    totRcnVal: apiData.currentValues.totalReplacementCostValue,
    
    // Prior values (flattened from priorValues object)
    priorLandVal: apiData.priorValues.landValue,
    priorBldVal: apiData.priorValues.buildingValue,
    priorXFeaturesVal: apiData.priorValues.extraFeaturesValue,
    priorAgVal: apiData.priorValues.agriculturalValue,
    priorTotApprVal: apiData.priorValues.totalAppraisedValue,
    priorTotMktVal: apiData.priorValues.totalMarketValue,
    
    // Status fields (flattened from status object)
    valueStatus: apiData.status.valueStatus,
    noticed: apiData.status.noticed,
    noticeDt: apiData.status.noticeDate,
    protested: apiData.status.protested,
    certifiedDate: apiData.status.certifiedDate,
    revDt: apiData.status.revisionDate,
    revBy: apiData.status.revisedBy,
    newOwnDt: apiData.status.newOwnerDate,
    
    // Legal fields (flattened from legal object)
    lgl1: apiData.legal.description,
    
    // Metadata - transform from ISO strings to Date objects
    createdAt: new Date(apiData.metadata.createdAt),
    updatedAt: new Date(apiData.metadata.updatedAt),
    
    // Related data: legacy structural elements not available from API; leave empty
    structuralElements: [],
    fixtures: apiData.fixtures || undefined,
    extraFeatures: apiData.extraFeatures,
  };
}

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
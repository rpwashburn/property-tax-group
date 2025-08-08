// Consolidated Property Types
// This file contains all property-related types for the application

// REMOVED: import type { InferSelectModel } from 'drizzle-orm';
// REMOVED: import type { propertyData } from '@/drizzle/schema';

// Base type from database schema (keeping for backward compatibility)
// Note: Property data is now handled by the backend API, but keeping this type for legacy compatibility
export type PropertyData = {
  id: string;
  acct: string;
  strNum: string | null;
  str: string | null;
  strSfx: string | null;
  strSfxDir: string | null;
  siteAddr1: string | null;
  siteAddr2: string | null;
  siteAddr3: string | null;
  stateClass: string | null;
  schoolDist: string | null;
  neighborhoodCode: string | null;
  neighborhoodGrp: string | null;
  marketArea1: string | null;
  marketArea1Dscr: string | null;
  marketArea2: string | null;
  marketArea2Dscr: string | null;
  econArea: string | null;
  econBldClass: string | null;
  yrImpr: string | null;
  yrAnnexed: string | null;
  bldAr: string | null;
  landAr: string | null;
  acreage: string | null;
  landVal: string | null;
  bldVal: string | null;
  xFeaturesVal: string | null;
  agVal: string | null;
  assessedVal: string | null;
  totApprVal: string | null;
  totMktVal: string | null;
  priorLandVal: string | null;
  priorBldVal: string | null;
  priorXFeaturesVal: string | null;
  priorAgVal: string | null;
  priorTotApprVal: string | null;
  priorTotMktVal: string | null;
  newConstructionVal: string | null;
  totRcnVal: string | null;
  valueStatus: string | null;
  noticed: string | null;
  noticeDt: string | null;
  protested: string | null;
  certifiedDate: string | null;
  revDt: string | null;
  revBy: string | null;
  newOwnDt: string | null;
  lgl1: string | null;
  jurs: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// New API Response Structure from Property API
export interface ApiPropertyResponse {
  id: string;
  accountId: string;
  address: {
    streetNumber: string | null;
    streetPrefix: string | null;
    streetName: string | null;
    streetSuffix: string | null;
    streetSuffixDirection: string | null;
    unitNumber: string | null;
    siteAddress1: string | null;
    siteAddress2: string | null;
    siteAddress3: string | null;
    formattedAddress: string | null;
  };
  classification: {
    stateClass: string | null;
    schoolDistrict: string | null;
    neighborhoodCode: string | null;
    neighborhoodGroup: string | null;
    neighborhoodDescription: string | null;
    jurisdiction: string | null;
  };
  marketInfo: {
    marketArea1: string | null;
    marketArea1Description: string | null;
    marketArea2: string | null;
    marketArea2Description: string | null;
    economicArea: string | null;
    economicBuildingClass: string | null;
  };
  characteristics: {
    yearImproved: number | null;
    yearAnnexed: number | null;
    buildingArea: string | null;
    landArea: string | null;
    acreage: string | null;
    dataYear: number | null;
  };
  currentValues: {
    landValue: string | null;
    buildingValue: string | null;
    extraFeaturesValue: string | null;
    agriculturalValue: string | null;
    assessedValue: string | null;
    totalAppraisedValue: string | null;
    totalMarketValue: string | null;
    newConstructionValue: string | null;
    totalReplacementCostValue: string | null;
  };
  priorValues: {
    landValue: string | null;
    buildingValue: string | null;
    extraFeaturesValue: string | null;
    agriculturalValue: string | null;
    assessedValue: string | null;
    totalAppraisedValue: string | null;
    totalMarketValue: string | null;
    newConstructionValue: string | null;
    totalReplacementCostValue: string | null;
  };
  status: {
    valueStatus: string | null;
    noticed: string | null;
    noticeDate: string | null;
    protested: string | null;
    certifiedDate: string | null;
    revisionDate: string | null;
    revisedBy: string | null;
    newOwnerDate: string | null;
  };
  legal: {
    description: string | null;
    legalLine1: string | null;
    legalLine2: string | null;
    legalLine3: string | null;
    legalLine4: string | null;
  };
  metadata: {
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
  };
  buildings: Array<{
    buildingNumber: number;
    buildingType: string;
    typeDescription: string;
    buildingQualityCode: string;
    buildingQuality: string;
    gradeAdjustment: string;
    buildingCondition: string;
    yearBuilt: number;
    squareFeet: number;
    actualArea: number;
    heatedArea: number;
    grossArea: number;
    effectiveArea: number;
    baseArea: number;
    improvementType: string;
    improvementModelCode: string;
    depreciationValue: number;
    replacementCost: number;
    depreciationPercent: number;
    effectiveYear: number;
    yearRemodeled: number;
    notes: string;
  }>;
  fixtures: Array<{
    bldNum: string;
    type: string;
    typeDscr: string;
    units: number;
  }> | null;
  extraFeatures: Array<{
    type: string;
    description: string | null;
    grade: string | null;
    condition: string | null;
    buildingNumber: number | null;
    length: string | null;
    width: string | null;
    units: string | null;
    unitPrice: string | null;
    adjustedUnitPrice: string | null;
    percentComplete: string | null;
    actualYear: number | null;
    effectiveYear: number | null;
    rollYear: number | null;
    date: string | null;
    percentCondition: string | null;
    depreciatedValue: string | null;
    note: string | null;
    assessedValue: string | null;
    count: number;
    category: string;
    shortDescription: string;
  }>;
  owners: Array<{
    name: string;
    mailingAddress: string;
    ownershipType: string;
  }>;
}

// Extended type that maintains backward compatibility while supporting new API structure
export interface EnrichedPropertyData {
  // Core identifiers
  id: string;
  acct: string; // Maps from accountId
  
  // Address fields (flattened from address object)
  strNum: string | null; // Maps from address.streetNumber
  str: string | null; // Maps from address.streetName
  strSfx: string | null; // Maps from address.streetSuffix
  strSfxDir: string | null; // Maps from address.streetSuffixDirection
  siteAddr1: string | null; // Maps from address.siteAddress1
  siteAddr2: string | null; // Maps from address.siteAddress2
  siteAddr3: string | null; // Maps from address.siteAddress3
  
  // Classification fields (flattened from classification object)
  stateClass: string | null;
  schoolDist: string | null; // Maps from schoolDistrict
  neighborhoodCode: string | null;
  neighborhoodGrp: string | null; // Maps from neighborhoodGroup
  neighborhoodDescription: string | null;
  jurs: string | null; // Maps from jurisdiction
  
  // Market info fields (flattened from marketInfo object)
  marketArea1: string | null;
  marketArea1Dscr: string | null; // Maps from marketArea1Description
  marketArea2: string | null;
  marketArea2Dscr: string | null; // Maps from marketArea2Description
  econArea: string | null; // Maps from economicArea
  econBldClass: string | null; // Maps from economicBuildingClass
  
  // Characteristics fields (flattened from characteristics object)
  yrImpr: string | null; // Maps from yearImproved (converted to string)
  yrAnnexed: string | null; // Maps from yearAnnexed (converted to string)
  bldAr: string | null; // Maps from buildingArea
  landAr: string | null; // Maps from landArea
  acreage: string | null;
  
  // Current values (flattened from currentValues object)
  landVal: string | null; // Maps from landValue
  bldVal: string | null; // Maps from buildingValue
  xFeaturesVal: string | null; // Maps from extraFeaturesValue
  agVal: string | null; // Maps from agriculturalValue
  assessedVal: string | null; // Maps from assessedValue
  totApprVal: string | null; // Maps from totalAppraisedValue
  totMktVal: string | null; // Maps from totalMarketValue
  newConstructionVal: string | null; // Maps from newConstructionValue
  totRcnVal: string | null; // Maps from totalReplacementCostValue
  
  // Prior values (flattened from priorValues object)
  priorLandVal: string | null;
  priorBldVal: string | null;
  priorXFeaturesVal: string | null;
  priorAgVal: string | null;
  priorTotApprVal: string | null; // Critical for year-over-year calculation
  priorTotMktVal: string | null;
  
  // Status fields (flattened from status object)
  valueStatus: string | null;
  noticed: string | null;
  noticeDt: string | null; // Maps from noticeDate
  protested: string | null;
  certifiedDate: string | null;
  revDt: string | null; // Maps from revisionDate
  revBy: string | null; // Maps from revisedBy
  newOwnDt: string | null; // Maps from newOwnerDate
  
  // Legal fields (flattened from legal object)
  lgl1: string | null; // Maps from description or combination of legalLine fields
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Related data
  structuralElements?: Array<{
    bldNum: string;
    code: string;
    adj: string | null;
    type: string;
    typeDscr: string;
    categoryDscr: string;
    dorCd: string;
  }>;
  fixtures?: Array<{
    bldNum: string;
    type: string;
    typeDscr: string;
    units: number;
  }>;
  extraFeatures?: Array<{
    type: string;
    description: string | null;
    grade: string | null;
    condition: string | null;
    buildingNumber: number | null;
    length: string | null;
    width: string | null;
    units: string | null;
    unitPrice: string | null;
    adjustedUnitPrice: string | null;
    percentComplete: string | null;
    actualYear: number | null;
    effectiveYear: number | null;
    rollYear: number | null;
    date: string | null;
    percentCondition: string | null;
    depreciatedValue: string | null;
    note: string | null;
    assessedValue: string | null;
    // New fields from API
    count?: number;
    category?: string;
    shortDescription?: string;
  }>;
}

// Property API Error type
export interface PropertyApiError extends Error {
  status?: number;
  statusText?: string;
}

// Property API Request Options
export interface PropertyApiOptions {
  include?: Array<'buildings' | 'owners' | 'assessments' | 'geographic' | 'extraFeatures'>;
  cache?: boolean;
  revalidate?: number; // seconds
}

// Property Search Response
export interface PropertySearchResponse {
  properties: ApiPropertyResponse[];
  total: number;
  page: number;
  limit: number;
}

// Property Health Check Response
export interface PropertyApiHealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
}

// New API types for the updated admin comparables functionality

export interface AddressInfo {
  streetNumber?: string | null;
  streetPrefix?: string | null;
  streetName?: string | null;
  streetSuffix?: string | null;
  streetSuffixDirection?: string | null;
  unitNumber?: string | null;
  siteAddress1?: string | null;
  siteAddress2?: string | null;
  siteAddress3?: string | null;
  formattedAddress?: string | null;
}

export interface ClassificationInfo {
  stateClass?: string | null;
  schoolDistrict?: string | null;
  neighborhoodCode?: string | null;
  neighborhoodGroup?: string | null;
  neighborhoodDescription?: string | null;
  jurisdiction?: string | null;
}

export interface ValuationInfo {
  landValue?: string | null;
  buildingValue?: string | null;
  extraFeaturesValue?: string | null;
  agriculturalValue?: string | null;
  assessedValue?: string | null;
  totalAppraisedValue?: string | null;
  totalMarketValue?: string | null;
  newConstructionValue?: string | null;
  totalReplacementCostValue?: string | null;
}

export interface PropertySummaryResponse {
  // Basic identification
  id?: string | null;
  accountId: string;

  // Structured data groups
  address: AddressInfo;
  classification: ClassificationInfo;
  currentValues: ValuationInfo;
  priorValues: ValuationInfo;

  // Primary building quality information
  buildingQualityCode?: string | null;
  gradeAdjustment?: string | null;
}

export interface ComparablesResponse {
  comparables: Array<{
    accountId: string;
    address: AddressInfo;
    classification: ClassificationInfo;
    currentValues: ValuationInfo;
    buildingQualityCode?: string | null;
    gradeAdjustment?: string | null;
    adjustments?: {
      [key: string]: number;
    };
  }>;
  total: number;
  searchCriteria: {
    subject_account_id: string;
    state_class: string;
    neighborhood_code: string;
    building_quality_code: string;
    grade_adjustment: string;
  };
} 

// Enhanced Comparables API Response Types (matching actual API response)
export interface DetailedComparablesResponse {
  comparables: DetailedComparable[];
  total_count: number;
  original_total_count: number;
  median_comparable_value: number;
}

export interface DetailedComparable {
  account_id: string;
  address: string;
  basic_info: {
    square_footage: number;
    year_built: number;
    neighborhood_code: string;
    state_class: string;
    building_condition: string;
    building_quality_code: string;
    building_quality: string;
  };
  financial_data: {
    original_market_value: number;
    original_appraised_value: number;
    adjusted_value: number;
    adjusted_price_per_sqft: number;
    original_price_per_sqft: number;
  };
  adjustments: {
    size_adjustment_pct: number;
    age_adjustment_pct: number;
    features_adjustment_pct: number;
    land_adjustment_pct: number;
    total_adjustment_pct: number;
    size_adjustment_amount: number;
    age_adjustment_amount: number;
    features_adjustment_amount: number;
    land_adjustment_amount: number;
    comp_improvement_psf: number;
    adjusted_improvement_value: number;
  };
  analysis: {
    comparable_score: number;
    adjustment_notes: string[];
    protest_justification?: {
      market_argument: string;
      supporting_factors: string[];
      market_context: string;
      summary: string;
      confidence_level: string;
    };
  };
} 

 
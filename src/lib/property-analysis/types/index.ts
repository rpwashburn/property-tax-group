import type { ExtraFeature } from './extra-features-types';
import type { propertyData } from '@/drizzle/schema';
import type { InferSelectModel } from 'drizzle-orm';

// Base type from database schema (keeping for backward compatibility)
export type PropertyData = InferSelectModel<typeof propertyData>;

// New API Response Structure
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
    bldNum: string;
    code: string;
    adj: string | null;
    type: string;
    typeDscr: string;
    categoryDscr: string;
    dorCd: string;
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

export type ComparableProperty = Pick<
  EnrichedPropertyData,
  | 'id'
  | 'acct'
  | 'siteAddr1'
  | 'siteAddr3'
  | 'stateClass'
  | 'neighborhoodCode'
  | 'yrImpr'
  | 'bldAr'
  | 'landAr'
  | 'acreage'
  | 'landVal'
  | 'totMktVal'
  | 'totApprVal'
  | 'bldVal'
  | 'xFeaturesVal'
> & {
  grade?: string | null;
  condition?: string | null;
};

export type SubjectProperty = ComparableProperty & {
  grade?: string | null;
  condition?: string | null;
}; 
import type { propertyData } from '@/drizzle/schema';
import type { InferSelectModel } from 'drizzle-orm';

export interface PropertyData {
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
  neighborhoodCode: string;
  neighborhoodDescription?: string;
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
}

export type ComparableProperty = Pick<
  InferSelectModel<typeof propertyData>,
  |
  'id' |
  'acct' |
  'siteAddr1' |
  'siteAddr3'
  |
  'stateClass' |
  'neighborhoodCode' |
  'yrImpr' |
  'bldAr'
  |
  'landAr'
  |
  'acreage' |
  'landVal'
  |
  'totMktVal'
  |
  'totApprVal'
  |
  'bldVal'
  |
  'xFeaturesVal'
> & {
  grade?: string | null;
  condition?: string | null;
};

export type SubjectProperty = ComparableProperty & {
    grade?: string | null;
    condition?: string | null;
};

export type AdjustedComparable = ComparableProperty & { 
    adjustments: import('../comparables/calculations').AdjustmentCalculations | null 
}; 
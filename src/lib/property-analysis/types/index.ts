import type { ExtraFeature } from './extra-features-types';
import type { propertyData } from '@/drizzle/schema';
import type { InferSelectModel } from 'drizzle-orm';

// Base type from database schema
export type PropertyData = InferSelectModel<typeof propertyData>;

// Extended type with additional properties and relations
export interface EnrichedPropertyData extends PropertyData {
  neighborhoodDescription?: string | null;
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
  extraFeatures?: ExtraFeature[];
}

export type ComparableProperty = Pick<
  PropertyData,
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
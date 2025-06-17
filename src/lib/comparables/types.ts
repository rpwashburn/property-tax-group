import type { EnrichedPropertyData } from '../property-analysis/types';

// Define the structure for search criteria
export type PropertySearchCriteria = {
  address?: string;
  minSqft?: number;
  maxSqft?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  neighborhoodCode?: string;
  grade?: string;
  condition?: string;
  // Add more criteria as needed
};

export interface Comparable {
  rank: number
  acct: string
  address: string
  adjusted_value: string
  adjusted_psf: string
  rationale: string
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

export interface ComparablesAPIResponse {
  total_found: number
  median_comparable_value: number
  comparables: ComparableProperty[]
}

export interface ComparablesSearchCriteria {
  subject_account_id: string
  state_class: string
  neighborhood_code: string
  quality_condition: string
}

export type AdjustedComparable = ComparableProperty & {
  adjustments: import('./calculations').AdjustmentCalculations | null
};
import type { EnrichedPropertyData } from '@/lib/properties';

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

// API Response structures from the external comparables API
export interface ComparableFromAPI {
  account_id: string
  address: string
  basic_info: {
    square_footage: number
    year_built: number
    neighborhood_code: string
    state_class: string
    building_condition: string
    building_quality_code: string
    building_quality: string
  }
  financial_data: {
    original_market_value: number
    original_appraised_value: number
    adjusted_value: number
    adjusted_price_per_sqft: number
    original_price_per_sqft: number
  }
  adjustments: {
    size_adjustment_pct: number
    age_adjustment_pct: number
    features_adjustment_pct: number
    land_adjustment_pct: number
    total_adjustment_pct: number
    size_adjustment_amount: number
    age_adjustment_amount: number
    features_adjustment_amount: number
    land_adjustment_amount: number
    comp_improvement_psf: number
    adjusted_improvement_value: number
  }
  analysis: {
    comparable_score: number
    adjustment_notes: string[]
  }
}

export interface ComparablesAPIResponse {
  total_count: number
  median_comparable_value: number
  comparables: ComparableFromAPI[]
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
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
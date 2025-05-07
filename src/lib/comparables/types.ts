import type { propertyData } from '@/drizzle/schema';
import type { InferSelectModel } from 'drizzle-orm';

// Define which fields from propertyData we want to return in search results
export type ComparableProperty = Pick<
  InferSelectModel<typeof propertyData>,
  |
  'id' |
  'acct' |
  'siteAddr1' |
  'siteAddr3' // city, state zip
  |
  'stateClass' |
  'neighborhoodCode' |
  'yrImpr' |
  'bldAr' // Building area (sqft)
  |
  'landAr' // Land area (sqft)
  |
  'acreage' |
  'landVal' // Add Land Value
  |
  'totMktVal' // Total Market Value
  |
  'bldVal' // Add Building Value
  |
  'xFeaturesVal' // Add Extra Features Value
> & { // Add grade and condition as optional fields
  grade?: string | null;
  condition?: string | null;
};

// Define the structure for search criteria
export type PropertySearchCriteria = {
  address?: string;
  minSqft?: number;
  maxSqft?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  neighborhoodCode?: string; // Add neighborhood code filter
  grade?: string; // Add grade filter
  condition?: string; // Add condition filter
  // Add more criteria as needed
};

// Add the export for AdjustedComparable type
export type AdjustedComparable = ComparableProperty & { 
    adjustments: import('./calculations').AdjustmentCalculations | null 
}; 
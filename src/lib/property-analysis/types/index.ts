// Re-export consolidated property types for backward compatibility
export type {
  PropertyData,
  ApiPropertyResponse,
  EnrichedPropertyData,
  PropertyApiError,
  PropertyApiOptions,
  PropertySearchResponse,
  PropertyApiHealthResponse
} from '@/lib/properties/types/types';

// Continue to export analysis-specific types
export * from './analysis-types';
export * from './deduction-types';
export * from './extra-features-types';
export * from './housing-market-types';
export * from './override-types'; 
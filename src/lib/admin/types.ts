import type * as schema from '@/drizzle/schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Infer types from Drizzle schema

// PropertyData
export type PropertyData = InferSelectModel<typeof schema.propertyData>;
export type NewPropertyData = InferInsertModel<typeof schema.propertyData>;

// NeighborhoodCodes
export type NeighborhoodCode = InferSelectModel<typeof schema.neighborhoodCodes>;
export type NewNeighborhoodCode = InferInsertModel<typeof schema.neighborhoodCodes>;

// StructuralElements
export type StructuralElement = InferSelectModel<typeof schema.structuralElements>;
export type NewStructuralElement = InferInsertModel<typeof schema.structuralElements>;

// Fixtures
export type Fixture = InferSelectModel<typeof schema.fixtures>;
export type NewFixture = InferInsertModel<typeof schema.fixtures>;

// You can add more specific types for forms or display if needed 
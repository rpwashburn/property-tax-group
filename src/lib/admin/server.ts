// This file contains server-side functions and Server Actions for admin CRUD operations.
'use server'

// TODO: Property CRUD operations have been disabled - property data moved to backend API
// Only auth-related admin functions should be implemented here now

// REMOVED: Database imports for property tables
// import { db } from '@/drizzle/db';
// import * as schema from '@/drizzle/schema';
// import { eq, desc, asc, count } from 'drizzle-orm';

import { revalidatePath } from 'next/cache';
import type {
  NeighborhoodCode,
  NewNeighborhoodCode,
  PropertyData,
  NewPropertyData,
  StructuralElement,
  NewStructuralElement,
  Fixture,
  NewFixture,
} from './types';

// Helper function for error handling
function handleError(operation: string, error: unknown) {
  console.error(`Error during ${operation}:`, error);
  return { success: false, error: `Failed to ${operation}.` };
}

// Helper function for disabled functionality
function disabledFunction(functionName: string) {
  console.warn(`[admin/server.ts] ${functionName} is disabled - property data moved to backend API`);
  console.warn(`[admin/server.ts] Please implement ${functionName} via your backend API`);
  return { 
    success: false, 
    error: `${functionName} is temporarily disabled - property data moved to backend API`,
    data: [],
    totalCount: 0
  };
}

// --- Neighborhood Codes --- //
// DISABLED: These functions used the old database schema

export async function getNeighborhoodCodes(limit: number = 50, offset: number = 0) {
  return disabledFunction('getNeighborhoodCodes');
}

export async function createNeighborhoodCode(data: NewNeighborhoodCode) {
  return disabledFunction('createNeighborhoodCode');
}

export async function updateNeighborhoodCode(id: number, data: Partial<NewNeighborhoodCode>) {
  return disabledFunction('updateNeighborhoodCode');
}

export async function deleteNeighborhoodCode(id: number) {
  return disabledFunction('deleteNeighborhoodCode');
}

// --- Property Data --- //
// DISABLED: These functions used the old database schema

export async function getAllPropertyData(limit: number = 50, offset: number = 0) {
  return disabledFunction('getAllPropertyData');
}

export async function getPropertyDataById(id: string) {
  return {
    success: false,
    error: 'getPropertyDataById is disabled - property data moved to backend API',
    data: undefined
  };
}

export async function createPropertyData(data: NewPropertyData) {
  return disabledFunction('createPropertyData');
}

export async function updatePropertyData(id: string, data: Partial<NewPropertyData>) {
  return disabledFunction('updatePropertyData');
}

export async function deletePropertyData(id: string) {
  return disabledFunction('deletePropertyData');
}

// --- Structural Elements --- //
// DISABLED: These functions used the old database schema

export async function getAllStructuralElements(limit: number = 50, offset: number = 0) {
  return disabledFunction('getAllStructuralElements');
}

export async function getStructuralElementById(id: string) {
  return {
    success: false,
    error: 'getStructuralElementById is disabled - property data moved to backend API',
    data: undefined
  };
}

export async function createStructuralElement(data: NewStructuralElement) {
  return disabledFunction('createStructuralElement');
}

export async function updateStructuralElement(id: string, data: Partial<NewStructuralElement>) {
  return disabledFunction('updateStructuralElement');
}

export async function deleteStructuralElement(id: string) {
  return disabledFunction('deleteStructuralElement');
}

// --- Fixtures --- //
// DISABLED: These functions used the old database schema

export async function getAllFixtures(limit: number = 50, offset: number = 0) {
  return disabledFunction('getAllFixtures');
}

export async function getFixtureById(id: string) {
  return {
    success: false,
    error: 'getFixtureById is disabled - property data moved to backend API',
    data: undefined
  };
}

export async function createFixture(data: NewFixture) {
  return disabledFunction('createFixture');
}

export async function updateFixture(id: string, data: Partial<NewFixture>) {
  return disabledFunction('updateFixture');
}

export async function deleteFixture(id: string) {
  return disabledFunction('deleteFixture');
} 
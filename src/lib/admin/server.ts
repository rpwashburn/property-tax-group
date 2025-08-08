// This file contains server-side functions and Server Actions for admin CRUD operations.
'use server'

// TODO: Property CRUD operations have been disabled - property data moved to backend API
// Only auth-related admin functions should be implemented here now

// REMOVED: Database imports for property tables
// import { db } from '@/drizzle/db';
// import * as schema from '@/drizzle/schema';
// import { eq, desc, asc, count } from 'drizzle-orm';

// import { revalidatePath } from 'next/cache';
// import type {
//   NeighborhoodCode,
//   NewNeighborhoodCode,
//   PropertyData,
//   NewPropertyData,
//   StructuralElement,
//   NewStructuralElement,
//   Fixture,
//   NewFixture,
// } from './types';

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

export async function createNeighborhoodCode(_data: unknown) {
  return disabledFunction('createNeighborhoodCode');
}

export async function updateNeighborhoodCode(_id: number, _data: unknown) {
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

export async function createPropertyData(_data: unknown) {
  return disabledFunction('createPropertyData');
}

export async function updatePropertyData(_id: string, _data: unknown) {
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

export async function createStructuralElement(_data: unknown) {
  return disabledFunction('createStructuralElement');
}

export async function updateStructuralElement(_id: string, _data: unknown) {
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

export async function createFixture(_data: unknown) {
  return disabledFunction('createFixture');
}

export async function updateFixture(_id: string, _data: unknown) {
  return disabledFunction('updateFixture');
}

export async function deleteFixture(id: string) {
  return disabledFunction('deleteFixture');
}

// --- Orders Management (Backend API) --- //

/**
 * Get orders from the backend API with optional filtering by status
 */
export async function getOrders(
  page: number = 1, 
  pageSize: number = 20, 
  status?: string
): Promise<{ success: boolean; data?: import('./types').OrdersResponse; error?: string; }> {
  try {
    const baseUrl = process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
    const url = new URL(`${baseUrl}/api/v1/admin/orders`);
    
    // Add query parameters
    url.searchParams.set('page', page.toString());
    url.searchParams.set('page_size', pageSize.toString());
    
    if (status) {
      url.searchParams.set('status', status);
    }

    console.log(`[AdminAPI] Fetching orders from: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'FightYourTax-AI-Admin/1.0',
      },
      // No cache for admin data
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[AdminAPI] Orders API error: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        error: `Failed to fetch orders: ${response.status} ${response.statusText}` 
      };
    }

    const data = await response.json();
    console.log(`[AdminAPI] Successfully fetched ${data.total_count} orders`);
    
    return { success: true, data };
  } catch (error) {
    console.error('[AdminAPI] Error fetching orders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch orders' 
    };
  }
}

/**
 * Get orders with payment_completed status specifically
 */
export async function getCompletedOrders(page: number = 1, pageSize: number = 20) {
  return getOrders(page, pageSize, 'payment_completed');
}

 
// This file will contain server-side functions and Server Actions for admin CRUD operations.
'use server'

import { db } from '@/drizzle/db';
import * as schema from '@/drizzle/schema';
import { eq, desc, asc, sql, count } from 'drizzle-orm';
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

// --- Neighborhood Codes --- //

export async function getNeighborhoodCodes(limit: number = 50, offset: number = 0) {
  try {
    const codes = await db.select()
      .from(schema.neighborhoodCodes)
      .orderBy(asc(schema.neighborhoodCodes.code))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const countResult = await db.select({ total: count() }).from(schema.neighborhoodCodes);
    const totalCount = countResult[0]?.total ?? 0;

    return { success: true, data: codes as NeighborhoodCode[], totalCount };
  } catch (error) {
    // Adjust error handling if needed, ensure it doesn't return data on error
    const result = handleError('fetch neighborhood codes', error);
    return { ...result, data: [], totalCount: 0 }; 
  }
}

export async function createNeighborhoodCode(data: NewNeighborhoodCode) {
  try {
    const [newCode] = await db.insert(schema.neighborhoodCodes).values(data).returning();
    revalidatePath('/admin/neighborhoods');
    return { success: true, data: newCode as NeighborhoodCode };
  } catch (error) {
    return handleError('create neighborhood code', error);
  }
}

export async function updateNeighborhoodCode(id: number, data: Partial<NewNeighborhoodCode>) {
  if (typeof id !== 'number') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    // Ensure updatedAt is updated
    const updateData = { ...data, updatedAt: new Date() };
    const [updatedCode] = await db.update(schema.neighborhoodCodes).set(updateData).where(eq(schema.neighborhoodCodes.id, id)).returning();
    revalidatePath('/admin/neighborhoods');
    revalidatePath(`/admin/neighborhoods/${id}`); // Also revalidate specific item page if exists
    return { success: true, data: updatedCode as NeighborhoodCode };
  } catch (error) {
    return handleError('update neighborhood code', error);
  }
}

export async function deleteNeighborhoodCode(id: number) {
  if (typeof id !== 'number') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    await db.delete(schema.neighborhoodCodes).where(eq(schema.neighborhoodCodes.id, id));
    revalidatePath('/admin/neighborhoods');
    return { success: true };
  } catch (error) {
    return handleError('delete neighborhood code', error);
  }
}

// --- Property Data --- //

export async function getAllPropertyData(limit: number = 50, offset: number = 0) {
  try {
    const data = await db.select()
      .from(schema.propertyData)
      .orderBy(desc(schema.propertyData.createdAt)) // Example ordering
      .limit(limit)
      .offset(offset);
    // Consider adding count for pagination
    // const countResult = await db.select({ count: sql`count(*)` }).from(schema.propertyData);
    // const totalCount = countResult[0]?.count ?? 0;
    return { success: true, data: data as PropertyData[] };
  } catch (error) {
    return handleError('fetch property data', error);
  }
}

export async function getPropertyDataById(id: string) {
  try {
    const [item] = await db.select().from(schema.propertyData).where(eq(schema.propertyData.id, id));
    return { success: true, data: item as PropertyData | undefined };
  } catch (error) {
    return handleError(`fetch property data by id ${id}`, error);
  }
}

export async function createPropertyData(data: NewPropertyData) {
  try {
    const [newItem] = await db.insert(schema.propertyData).values(data).returning();
    revalidatePath('/admin/properties');
    return { success: true, data: newItem as PropertyData };
  } catch (error) {
    return handleError('create property data', error);
  }
}

export async function updatePropertyData(id: string, data: Partial<NewPropertyData>) {
  if (typeof id !== 'string') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    const updateData = { ...data, updatedAt: new Date() };
    const [updatedItem] = await db.update(schema.propertyData).set(updateData).where(eq(schema.propertyData.id, id)).returning();
    revalidatePath('/admin/properties');
    revalidatePath(`/admin/properties/${id}`);
    return { success: true, data: updatedItem as PropertyData };
  } catch (error) {
    return handleError('update property data', error);
  }
}

export async function deletePropertyData(id: string) {
  if (typeof id !== 'string') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    await db.delete(schema.propertyData).where(eq(schema.propertyData.id, id));
    revalidatePath('/admin/properties');
    return { success: true };
  } catch (error) {
    return handleError('delete property data', error);
  }
}

// --- Structural Elements --- //

export async function getAllStructuralElements(limit: number = 50, offset: number = 0) {
  try {
    const data = await db.select()
      .from(schema.structuralElements)
      .orderBy(desc(schema.structuralElements.createdAt)) // Example ordering
      .limit(limit)
      .offset(offset);
    return { success: true, data: data as StructuralElement[] };
  } catch (error) {
    return handleError('fetch structural elements', error);
  }
}

export async function getStructuralElementById(id: string) {
  try {
    const [item] = await db.select().from(schema.structuralElements).where(eq(schema.structuralElements.id, id));
    return { success: true, data: item as StructuralElement | undefined };
  } catch (error) {
    return handleError(`fetch structural element by id ${id}`, error);
  }
}

export async function createStructuralElement(data: NewStructuralElement) {
  try {
    const [newItem] = await db.insert(schema.structuralElements).values(data).returning();
    revalidatePath('/admin/structural-elements');
    return { success: true, data: newItem as StructuralElement };
  } catch (error) {
    return handleError('create structural element', error);
  }
}

export async function updateStructuralElement(id: string, data: Partial<NewStructuralElement>) {
  if (typeof id !== 'string') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    const updateData = { ...data, updatedAt: new Date() };
    const [updatedItem] = await db.update(schema.structuralElements).set(updateData).where(eq(schema.structuralElements.id, id)).returning();
    revalidatePath('/admin/structural-elements');
    revalidatePath(`/admin/structural-elements/${id}`);
    return { success: true, data: updatedItem as StructuralElement };
  } catch (error) {
    return handleError('update structural element', error);
  }
}

export async function deleteStructuralElement(id: string) {
  if (typeof id !== 'string') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    await db.delete(schema.structuralElements).where(eq(schema.structuralElements.id, id));
    revalidatePath('/admin/structural-elements');
    return { success: true };
  } catch (error) {
    return handleError('delete structural element', error);
  }
}

// --- Fixtures --- //

export async function getAllFixtures(limit: number = 50, offset: number = 0) {
  try {
    const data = await db.select()
      .from(schema.fixtures)
      .orderBy(desc(schema.fixtures.createdAt)) // Example ordering
      .limit(limit)
      .offset(offset);
    return { success: true, data: data as Fixture[] };
  } catch (error) {
    return handleError('fetch fixtures', error);
  }
}

export async function getFixtureById(id: string) {
  try {
    const [item] = await db.select().from(schema.fixtures).where(eq(schema.fixtures.id, id));
    return { success: true, data: item as Fixture | undefined };
  } catch (error) {
    return handleError(`fetch fixture by id ${id}`, error);
  }
}

export async function createFixture(data: NewFixture) {
  try {
    const [newItem] = await db.insert(schema.fixtures).values(data).returning();
    revalidatePath('/admin/fixtures');
    return { success: true, data: newItem as Fixture };
  } catch (error) {
    return handleError('create fixture', error);
  }
}

export async function updateFixture(id: string, data: Partial<NewFixture>) {
  if (typeof id !== 'string') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    const updateData = { ...data, updatedAt: new Date() };
    const [updatedItem] = await db.update(schema.fixtures).set(updateData).where(eq(schema.fixtures.id, id)).returning();
    revalidatePath('/admin/fixtures');
    revalidatePath(`/admin/fixtures/${id}`);
    return { success: true, data: updatedItem as Fixture };
  } catch (error) {
    return handleError('update fixture', error);
  }
}

export async function deleteFixture(id: string) {
  if (typeof id !== 'string') {
    return { success: false, error: 'Invalid ID provided.' };
  }
  try {
    await db.delete(schema.fixtures).where(eq(schema.fixtures.id, id));
    revalidatePath('/admin/fixtures');
    return { success: true };
  } catch (error) {
    return handleError('delete fixture', error);
  }
} 
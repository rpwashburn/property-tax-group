#!/usr/bin/env tsx

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../src/drizzle/schema';
import { users, accounts } from '../src/drizzle/auth-schema';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Generate a random ID (similar to Better Auth's generateId)
function generateId(): string {
  return randomBytes(16).toString('hex');
}

// Configuration from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fightyourtax.ai';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thisIsOurProdPa55!!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
// load .env file


async function seedAdminUser() {
  console.log('🌱 Starting admin user seeding...');
  console.log('🌱 POSTGRES_URL:', process.env.POSTGRES_URL);

  // Connect to database
  const client = postgres(process.env.POSTGRES_URL!);
  const db = drizzle({ client, schema: { ...schema, users, accounts } });

  try {
    // Check if admin user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`ℹ️  Admin user with email ${ADMIN_EMAIL} already exists.`);
      
      // Check if user is already admin
      if (existingUser[0].role === 'admin') {
        console.log('✅ User is already an admin. No action needed.');
        return;
      }

      // Update existing user to admin
      await db
        .update(users)
        .set({ 
          role: 'admin',
          updatedAt: new Date()
        })
        .where(eq(users.email, ADMIN_EMAIL));

      console.log(`✅ Successfully promoted ${ADMIN_EMAIL} to admin role.`);
      return;
    }

    // Create new admin user
    console.log(`👤 Creating new admin user: ${ADMIN_EMAIL}`);

    // Generate user ID
    const userId = generateId();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Insert user
    await db.insert(users).values({
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true, // Admin starts verified
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create account for email/password authentication
    await db.insert(accounts).values({
      id: generateId(),
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    await seedAdminUser();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();

export { seedAdminUser }; 
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Load .env.local if it exists

const postgresUrl = process.env.POSTGRES_URL;

if (!postgresUrl) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

export default defineConfig({
    schema: './src/drizzle/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: postgresUrl,
    },
    out: './src/drizzle/migrations',
    verbose: true,
    strict: true,
});

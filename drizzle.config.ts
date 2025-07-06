import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env first, then .env.local (which will override if it exists)
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

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
    // Ignore tables from other migration systems (like Alembic)
    tablesFilter: ["!alembic_version"],
});

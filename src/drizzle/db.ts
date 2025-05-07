import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

import * as schemas from './schema'

if (!process.env.VERCEL_ENV) {
    neonConfig.wsProxy = (host) => `${host}:54331/v1`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
})

export const db = drizzle(pool, {
    schema: { ...schemas },
    logger: true,
})

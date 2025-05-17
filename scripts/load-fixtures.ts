import { Client } from "pg"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { fixtures } from "@/drizzle/schema"
import { readFileSync, readdirSync, statSync, createReadStream } from "fs"
import { join } from "path"
import { createInterface } from 'readline';
import { config } from "dotenv"

// Load environment variables
config()

const BATCH_SIZE = 1000;

// Function to find the latest data folder
const getLatestDataPath = (baseDir: string, fileName: string) => {
  const directories = readdirSync(baseDir)
    .map(name => join(baseDir, name))
    .filter(source => statSync(source).isDirectory())
    .filter(source => /\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(source)) // Filter by YYYY-MM-DD_HH-MM-SS pattern
    .sort((a, b) => b.localeCompare(a)); // Sort by name (timestamp) descending

  if (directories.length === 0) {
    throw new Error(`No timestamped data folders found in ${baseDir}`);
  }
  const latestDir = directories[0];
  const targetFilePath = join(latestDir, fileName);
  console.log(`Using data file: ${targetFilePath}`);
  return targetFilePath;
};

// FixtureFromFile interface might not be strictly needed if we use schema.$inferInsert
// interface FixtureFromFile { ... }

async function loadFixtures() {
  console.log("Starting fixtures data load...")
  
  // Replace pg.Client with Drizzle setup
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  const db = drizzle(pool, { schema: { fixtures } }); // Drizzle instance
  
  try {
    // client.connect() is not needed for Drizzle with node-postgres pool
    
    const baseDataDir = join(process.cwd(), "src/lib/property-analysis/data");
    const filePath = getLatestDataPath(baseDataDir, "fixtures.txt");
    
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isFirstLine = false; // Original script did not process headers, so keeping it false
    // let headers: string[] = []; // Not used if no header processing

    let totalProcessed = 0
    let successfulInserts = 0
    let failedInserts = 0
    let recordBatch: typeof fixtures.$inferInsert[] = [];

    const processBatch = async () => {
      if (recordBatch.length === 0) return;
      try {
        await db.insert(fixtures).values(recordBatch).onConflictDoNothing();
        successfulInserts += recordBatch.length;
      } catch (batchError) {
        console.error("\nError inserting batch:", batchError);
        failedInserts += recordBatch.length;
      }
      recordBatch = [];
    };
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      totalProcessed++;

      // No header processing, direct split as per original script
      // if (isFirstLine) { ... isFirstLine = false; continue; }
      
      try {
        const [acct, bld_num, type, type_dscr, units_str] = line.split("\t")
        
        const numericUnits = parseFloat(units_str.trim()) || 0;

        recordBatch.push({
          acct: acct.trim(),
          bldNum: bld_num.trim(), // Ensure schema field name `bldNum` is used
          type: type.trim(),
          typeDscr: type_dscr.trim(), // Ensure schema field name `typeDscr` is used
          units: String(numericUnits), // Convert numericUnits to string to match schema
        });
        
        if (recordBatch.length >= BATCH_SIZE) {
          await processBatch();
        }

      } catch (parseError) {
        // Catch errors from line.split or parseFloat if data is malformed
        console.error(`\nError parsing line ${totalProcessed}: ${line}`, parseError);
        failedInserts++; // Count this as a failed insert for the line
      }
      
      if (totalProcessed % 100 === 0) {
        process.stdout.write(
          `Processed: ${totalProcessed} | Inserted: ${successfulInserts} | Failed: ${failedInserts}\r`
        );
      }
    }
    
    await processBatch(); // Process remaining records
    process.stdout.write('\n');

    console.log("\nLoad Summary:")
    console.log(`Total records processed: ${totalProcessed}`)
    console.log(`Successfully inserted: ${successfulInserts}`)
    console.log(`Failed inserts: ${failedInserts}`)
  } finally {
    await pool.end(); // End the pool for Drizzle
  }
}

loadFixtures().catch(console.error) 
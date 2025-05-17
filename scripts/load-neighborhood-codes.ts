import { createReadStream, readdirSync, statSync } from "fs"
import { join } from "path"
import { createInterface } from "readline"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { neighborhoodCodes } from "@/drizzle/schema"
import * as dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

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

// Create database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const db = drizzle(pool, {
  schema: { neighborhoodCodes },
  logger: false, // Turn off Drizzle's default query logger
})

const BATCH_SIZE = 1000;

async function loadNeighborhoodCodes() {
  try {
    console.log("Starting neighborhood codes load...")
    
    const baseDataDir = join(process.cwd(), "src/lib/property-analysis/data");
    const filePath = getLatestDataPath(baseDataDir, "real_neighborhood_code.txt");
    
    // Create a read stream and readline interface
    const fileStream = createReadStream(filePath)
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })

    // Get headers and clean them
    const headerLine = (await rl[Symbol.asyncIterator]().next()).value
    const headers = headerLine
      .split("\t")
      .map((header: string) => header.trim())
      .filter((header: string) => header !== "")
    
    let count = 0
    let successCount = 0
    let errorCount = 0
    let recordBatch: typeof neighborhoodCodes.$inferInsert[] = [];

    const processBatch = async () => {
      if (recordBatch.length === 0) return;
      try {
        await db.insert(neighborhoodCodes).values(recordBatch).onConflictDoNothing();
        successCount += recordBatch.length;
      } catch (batchError) {
        console.error("\nError inserting batch:", batchError);
        errorCount += recordBatch.length;
      }
      recordBatch = [];
    };

    // Process each line
    for await (const line of rl) {
      count++
      
      const values = line
        .split("\t")
        .map((value: string) => value.trim())
        .filter((_, index) => index < headers.length)

      const neighborhoodCodeFromFile = headers.reduce((acc: Record<string, string>, header: string, index: number) => {
        const value = values[index] || ""
        acc[header] = value
        return acc
      }, {} as Record<string, string>)

      recordBatch.push({
        code: neighborhoodCodeFromFile.cd,
        groupCode: neighborhoodCodeFromFile.grp_cd,
        description: neighborhoodCodeFromFile.dscr,
      });

      if (recordBatch.length >= BATCH_SIZE) {
        await processBatch();
      }
      
      if (count % 100 === 0) {
        // Simplified progress, could be enhanced like the other script with ETA if wc -l is added
        process.stdout.write(
          `Processed: ${count} | Inserted: ${successCount} | Failed: ${errorCount}\r`
        );
      }
    }

    await processBatch(); // Process remaining records
    process.stdout.write('\n'); // New line after progress

    console.log("\nNeighborhood codes load completed!")
    console.log(`Total records processed: ${count}`)
    console.log(`Successfully inserted: ${successCount}`)
    console.log(`Failed to insert: ${errorCount}`)

  } catch (error) {
    console.error("Error loading neighborhood codes:", error)
  }
}

// Run the script
loadNeighborhoodCodes() 
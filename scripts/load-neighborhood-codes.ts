import { createReadStream } from "fs"
import { join } from "path"
import { createInterface } from "readline"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { neighborhoodCodes } from "@/drizzle/schema"
import * as dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Create database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const db = drizzle(pool, {
  schema: { neighborhoodCodes },
  logger: true,
})

async function loadNeighborhoodCodes() {
  try {
    console.log("Starting neighborhood codes load...")
    
    const filePath = join(process.cwd(), "src/lib/property-analysis/data/Real_acct_owner/real_neighborhood_code.txt")
    
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

    // Process each line
    for await (const line of rl) {
      count++
      
      // Split by tabs and clean up values
      const values = line
        .split("\t")
        .map((value: string) => value.trim())
        .filter((_, index) => index < headers.length)

      // Create neighborhood code object
      const neighborhoodCodeFromFile = headers.reduce((acc: Record<string, string>, header: string, index: number) => {
        // Clean up the value and handle empty strings
        const value = values[index] || ""
        acc[header] = value
        return acc
      }, {} as Record<string, string>)

      try {
        // Insert into database
        await db
          .insert(neighborhoodCodes)
          .values({
            code: neighborhoodCodeFromFile.cd,
            groupCode: neighborhoodCodeFromFile.grp_cd,
            description: neighborhoodCodeFromFile.dscr,
          })
          .onConflictDoNothing()

        successCount++
        
        // Log progress every 100 records
        if (count % 100 === 0) {
          console.log(`Processed ${count} records...`)
        }
      } catch (error) {
        errorCount++
        console.error(`Error processing record ${count}:`, error)
      }
    }

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
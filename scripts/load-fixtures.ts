import { Client } from "pg"
import { readFileSync } from "fs"
import { join } from "path"
import { config } from "dotenv"

// Load environment variables
config()

interface FixtureFromFile {
  acct: string
  bld_num: string
  type: string
  type_dscr: string
  units: string
}

async function loadFixtures() {
  console.log("Starting fixtures data load...")
  
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  })
  
  try {
    await client.connect()
    
    const filePath = join(process.cwd(), "src/lib/property-analysis/data/Real_building_land/fixtures.txt")
    const fileContent = readFileSync(filePath, "utf-8")
    
    const lines = fileContent.split("\n")
    let totalProcessed = 0
    let successfulInserts = 0
    let failedInserts = 0
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      try {
        const [acct, bld_num, type, type_dscr, units] = line.split("\t")
        
        const fixture: FixtureFromFile = {
          acct: acct.trim(),
          bld_num: bld_num.trim(),
          type: type.trim(),
          type_dscr: type_dscr.trim(),
          units: units.trim(),
        }
        
        // Convert units to numeric, defaulting to 0 if invalid
        const numericUnits = parseFloat(fixture.units) || 0
        
        const query = `
          INSERT INTO fixtures (acct, bld_num, type, type_dscr, units)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (acct, bld_num, type) DO NOTHING
        `
        
        await client.query(query, [
          fixture.acct,
          fixture.bld_num,
          fixture.type,
          fixture.type_dscr,
          numericUnits,
        ])
        
        successfulInserts++
      } catch (error) {
        console.error(`Failed to insert fixture: ${error}`)
        failedInserts++
      }
      
      totalProcessed++
      if (totalProcessed % 1000 === 0) {
        console.log(`Processed ${totalProcessed} records...`)
      }
    }
    
    console.log("\nLoad Summary:")
    console.log(`Total records processed: ${totalProcessed}`)
    console.log(`Successfully inserted: ${successfulInserts}`)
    console.log(`Failed inserts: ${failedInserts}`)
  } finally {
    await client.end()
  }
}

loadFixtures().catch(console.error) 
import { createReadStream } from "fs"
import { join } from "path"
import { createInterface } from "readline"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { propertyData } from "@/drizzle/schema"
import * as dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Create database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const db = drizzle(pool, {
  schema: { propertyData },
  logger: true,
})

async function loadPropertyData() {
  try {
    console.log("Starting property data load...")
    
    const filePath = join(process.cwd(), "src/lib/property-analysis/data/Real_acct_owner/real_acct.txt")
    
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

      // Create property data object
      const propertyDataFromFile = headers.reduce((acc: Record<string, string>, header: string, index: number) => {
        // Clean up the value and handle empty strings
        const value = values[index] || ""
        acc[header] = value
        return acc
      }, {} as Record<string, string>)

      try {
        // Insert into database
        await db
          .insert(propertyData)
          .values({
            acct: propertyDataFromFile.acct,
            strNum: propertyDataFromFile.str_num,
            str: propertyDataFromFile.str,
            strSfx: propertyDataFromFile.str_sfx,
            strSfxDir: propertyDataFromFile.str_sfx_dir,
            siteAddr1: propertyDataFromFile.site_addr_1,
            siteAddr2: propertyDataFromFile.site_addr_2,
            siteAddr3: propertyDataFromFile.site_addr_3,
            stateClass: propertyDataFromFile.state_class,
            schoolDist: propertyDataFromFile.school_dist,
            neighborhoodCode: propertyDataFromFile.Neighborhood_Code,
            neighborhoodGrp: propertyDataFromFile.Neighborhood_Grp,
            marketArea1: propertyDataFromFile.Market_Area_1,
            marketArea1Dscr: propertyDataFromFile.Market_Area_1_Dscr,
            marketArea2: propertyDataFromFile.Market_Area_2,
            marketArea2Dscr: propertyDataFromFile.Market_Area_2_Dscr,
            econArea: propertyDataFromFile.econ_area,
            econBldClass: propertyDataFromFile.econ_bld_class,
            yrImpr: propertyDataFromFile.yr_impr,
            yrAnnexed: propertyDataFromFile.yr_annexed,
            bldAr: propertyDataFromFile.bld_ar,
            landAr: propertyDataFromFile.land_ar,
            acreage: propertyDataFromFile.acreage,
            landVal: propertyDataFromFile.land_val,
            bldVal: propertyDataFromFile.bld_val,
            xFeaturesVal: propertyDataFromFile.x_features_val,
            agVal: propertyDataFromFile.ag_val,
            assessedVal: propertyDataFromFile.assessed_val,
            totApprVal: propertyDataFromFile.tot_appr_val,
            totMktVal: propertyDataFromFile.tot_mkt_val,
            priorLandVal: propertyDataFromFile.prior_land_val,
            priorBldVal: propertyDataFromFile.prior_bld_val,
            priorXFeaturesVal: propertyDataFromFile.prior_x_features_val,
            priorAgVal: propertyDataFromFile.prior_ag_val,
            priorTotApprVal: propertyDataFromFile.prior_tot_appr_val,
            priorTotMktVal: propertyDataFromFile.prior_tot_mkt_val,
            newConstructionVal: propertyDataFromFile.new_construction_val,
            totRcnVal: propertyDataFromFile.tot_rcn_val,
            valueStatus: propertyDataFromFile.value_status,
            noticed: propertyDataFromFile.noticed,
            noticeDt: propertyDataFromFile.notice_dt,
            protested: propertyDataFromFile.protested,
            certifiedDate: propertyDataFromFile.certified_date,
            revDt: propertyDataFromFile.rev_dt,
            revBy: propertyDataFromFile.rev_by,
            newOwnDt: propertyDataFromFile.new_own_dt,
            lgl1: propertyDataFromFile.lgl_1,
            jurs: propertyDataFromFile.jurs,
          })
          .onConflictDoNothing()

        successCount++
        
        // Log progress every 1000 records
        if (count % 1000 === 0) {
          console.log(`Processed ${count} records...`)
        }
      } catch (error) {
        errorCount++
        console.error(`Error processing record ${count}:`, error)
      }
    }

    console.log("\nProperty data load completed!")
    console.log(`Total records processed: ${count}`)
    console.log(`Successfully inserted: ${successCount}`)
    console.log(`Failed to insert: ${errorCount}`)

  } catch (error) {
    console.error("Error loading property data:", error)
  }
}

// Run the script
loadPropertyData() 
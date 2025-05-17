import { createReadStream, readdirSync, statSync } from "fs"
import { join } from "path"
import { createInterface } from "readline"
import { execSync } from 'child_process'; // Import execSync
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
  logger: false,
})

// Function to find the latest data folder
const getLatestDataPath = (baseDir: string, fileName: string) => {
  const directories = readdirSync(baseDir)
    .map(name => join(baseDir, name))
    .filter(source => statSync(source).isDirectory())
    .filter(source => /\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(source)) // Filter by YYYY-MM-DD_HH-MM-SS pattern
    .sort((a, b) => {
      const aStat = statSync(a);
      const bStat = statSync(b);
      return bStat.mtime.getTime() - aStat.mtime.getTime(); // Sort by modification time, descending
    });

  if (directories.length === 0) {
    throw new Error(`No timestamped data folders found in ${baseDir}`);
  }
  // It's possible the extracted file is Real_acct_owner.txt or real_acct.txt
  // The download script unzips Real_acct_owner.zip, so we expect Real_acct_owner.txt
  // However, the original script looked for real_acct.txt.
  // We will prioritize Real_acct_owner.txt if present, else real_acct.txt
  const latestDir = directories[0];
  let targetFilePath = join(latestDir, "Real_acct_owner.txt"); // Default to the name from the zip

  // Check if Real_acct_owner.txt exists, if not, try real_acct.txt
  // This part needs fs.existsSync which is not imported yet. Will add.
  // For now, assuming Real_acct_owner.txt is the correct name post-extraction
  // If this assumption is wrong, it might require another tweak.

  // We need to check if "Real_acct_owner.txt" or "real_acct.txt" exists.
  // The original script used "real_acct.txt" inside "Real_acct_owner" folder.
  // The new download script extracts "Real_acct_owner.zip" directly into the timestamped folder.
  // So the file should be "Real_acct_owner.txt" (or similar, depending on what's in the zip).
  // For now, let's assume the file name inside the zip is 'Real_acct_owner.txt'
  // If the actual file is 'real_acct.txt', this will need adjustment.
  // The problem description mentions "Real_acct_owner.zip" and "Real_building_land.zip".
  // Typically, unzipping Real_acct_owner.zip would yield files like Real_acct_owner.txt or similar.

  // Given the download script simply unzips, the path would be to the file directly in the timestamped folder.
  // The original script was looking for "real_acct.txt" inside a "Real_acct_owner" subfolder.
  // The new download script does not create this "Real_acct_owner" subfolder.
  // It extracts contents of Real_acct_owner.zip directly into the timestamped folder.
  // We need to know the exact name of the .txt file inside Real_acct_owner.zip.
  // For now, I will assume it is 'Real_acct_owner.txt' based on the zip name.
  // This is a common convention but not guaranteed.

  // Let's assume the file we are looking for within the latest timestamped directory is the `fileName` parameter.
  targetFilePath = join(latestDir, fileName);
  console.log(`Using data file: ${targetFilePath}`);
  return targetFilePath;
};

async function loadPropertyData() {
  try {
    console.log("Starting property data load...")
    
    // Fetch existing account IDs from the database
    console.log("Fetching existing account IDs from database...");
    const existingAccountsQuery = await db.selectDistinct({ acct: propertyData.acct }).from(propertyData);
    const existingAccountIds = new Set(existingAccountsQuery.map(item => item.acct));
    console.log(`Found ${existingAccountIds.size} existing account IDs.`);
    
    const baseDataDir = join(process.cwd(), "src/lib/property-analysis/data");
    // The file inside Real_acct_owner.zip is likely Real_acct_owner.txt or real_acct.txt
    // The original script used 'real_acct.txt'
    // Based on the extracted files, it is indeed 'real_acct.txt'
    const filePath = getLatestDataPath(baseDataDir, "real_acct.txt"); 
    
    // Get total lines for progress calculation
    let totalLines = 0;
    try {
      console.log(`\nCounting lines in ${filePath}...`);
      const wcOutput = execSync(`wc -l < "${filePath}"`).toString().trim();
      totalLines = parseInt(wcOutput, 10);
      console.log(`Total lines to process: ${totalLines}`);
    } catch (err) {
      console.error("\nError counting lines:", err);
      console.warn("Proceeding without ETA calculation.");
      totalLines = 0; // Set to 0 to disable ETA
    }
    
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
    let skippedExistingCount = 0; // Counter for skipped records
    const startTime = Date.now(); // Record start time
    const BATCH_SIZE = 1000; // Define batch size
    let recordBatch: typeof propertyData.$inferInsert[] = []; // Array to hold batch records

    const formatEta = (seconds: number): string => {
      if (isNaN(seconds) || seconds === Infinity || seconds < 0) {
        return '--:--';
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const updateProgress = () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const linesPerSecond = count / elapsedSeconds;
      const percentage = totalLines > 0 ? ((count / totalLines) * 100).toFixed(2) : 0;
      const remainingLines = totalLines > 0 ? totalLines - count : 0;
      const etaSeconds = totalLines > 0 && linesPerSecond > 0 ? remainingLines / linesPerSecond : 0;

      let progressString = `Processed: ${count}`;
      if (totalLines > 0) {
        progressString += `/${totalLines} (${percentage}%)`;
      }
      progressString += ` | Inserted: ${successCount} | Skipped: ${skippedExistingCount} | Failed: ${errorCount}`;
      if (totalLines > 0 && elapsedSeconds > 2) { // Show ETA after a couple of seconds
        progressString += ` | ETA: ${formatEta(etaSeconds)}`;
      }
      process.stdout.write(progressString + '\r');
    };

    const processBatch = async () => {
      if (recordBatch.length === 0) return;
      try {
        await db.insert(propertyData).values(recordBatch).onConflictDoNothing();
        successCount += recordBatch.length; // Assume all in batch are successful if no error (due to onConflictDoNothing)
      } catch (batchError) {
        console.error("\nError inserting batch:", batchError);
        errorCount += recordBatch.length; // If batch fails, count all as errors for simplicity
      }
      recordBatch = []; // Clear the batch
    };

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

      // Check if account already exists in our in-memory set
      if (existingAccountIds.has(propertyDataFromFile.acct)) {
        skippedExistingCount++;
        if (count % 100 === 0) { 
          updateProgress();
        }
        continue; 
      }

      // Add to batch instead of individual insert
      recordBatch.push({
        // Map propertyDataFromFile fields to propertyData schema
        // This assumes propertyDataFromFile keys match schema expectations after cleaning
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
      });

      if (recordBatch.length >= BATCH_SIZE) {
        await processBatch();
        // Update progress after processing a batch
        updateProgress(); 
      }
      
      // Update progress more frequently than just batch completion if desired, e.g. every 100 overall lines processed
      // This is already handled by the existing count % 100 check, but ensure updateProgress reflects current batch status correctly.
      // The current updateProgress call every 100 lines processed is fine.
      // However, for skipped records, the main progress logic won't show activity until a batch is flushed or 100 lines are hit.
      // Let's ensure progress is updated if a record is skipped too.
      // The `if (count % 100 === 0)` inside the skip block handles this for skipped.
      // And the `if (count % 100 === 0)` after a successful individual try-catch block (now removed) used to handle it.
      // Let's put a general progress update here for every N records regardless of batch flush.
      else if (count % 100 === 0) { // Update progress regularly even if batch not full
        updateProgress();
      }
    }
    
    // Process any remaining records in the batch after the loop finishes
    await processBatch();
    updateProgress(); // Final progress update

    // Clear the progress line before printing final summary
    process.stdout.write('\n');

    console.log("\nProperty data load completed!")
    console.log(`Total records processed: ${count}`)
    console.log(`Successfully inserted: ${successCount}`)
    console.log(`Skipped (already existing): ${skippedExistingCount}`)
    console.log(`Failed to insert: ${errorCount}`)

  } catch (error) {
    console.error("Error loading property data:", error)
  }
}

// Run the script
loadPropertyData() 
import { createReadStream } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import { execSync } from 'child_process';
import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { extraFeaturesDetail } from "@/drizzle/schema";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool, {
  schema: { extraFeaturesDetail },
  logger: false,
});

async function loadExtraFeaturesDetail() {
  try {
    console.log("Starting extra features detail data load...");

    // Fetch existing account IDs from the database
    console.log("Fetching existing account IDs from database...");
    const existingAccountsQuery = await db.selectDistinct({ acct: extraFeaturesDetail.acct }).from(extraFeaturesDetail);
    const existingAccountIds = new Set(existingAccountsQuery.map(item => item.acct));
    console.log(`Found ${existingAccountIds.size} existing account IDs.`);

    const baseDataDir = join(process.cwd(), "src/lib/property-analysis/data/2025-05-09_09-33-18");
    const dataFiles = ["extra_features_detail1.txt", "extra_features_detail2.txt"];

    for (const fileName of dataFiles) {
      const filePath = join(baseDataDir, fileName);
      console.log(`\nProcessing file: ${filePath}`);

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
        totalLines = 0;
      }

      // Create a read stream and readline interface
      const fileStream = createReadStream(filePath);
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let count = 0;
      let successCount = 0;
      let errorCount = 0;
      let skippedExistingCount = 0;
      const startTime = Date.now();
      const BATCH_SIZE = 1000;
      let recordBatch: typeof extraFeaturesDetail.$inferInsert[] = [];

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
        if (totalLines > 0 && elapsedSeconds > 2) {
          progressString += ` | ETA: ${formatEta(etaSeconds)}`;
        }
        process.stdout.write(progressString + '\r');
      };

      const processBatch = async () => {
        if (recordBatch.length === 0) return;
        try {
          await db.insert(extraFeaturesDetail).values(recordBatch);
          successCount += recordBatch.length;
        } catch (batchError) {
          console.error("\nError inserting batch:", batchError);
          errorCount += recordBatch.length;
        }
        recordBatch = [];
      };

      let isFirstLine = true;
      for await (const line of rl) {
        if (isFirstLine) {
          isFirstLine = false;
          continue;
        }

        count++;
        const columns = line.split("\t");

        const record: typeof extraFeaturesDetail.$inferInsert = {
          acct: columns[0]?.trim() || "",
          cd: columns[1]?.trim() || null,
          dscr: columns[2]?.trim() || null,
          grade: columns[3]?.trim() || null,
          condCd: columns[4]?.trim() || null,
          bldNum: columns[5] ? parseInt(columns[5].trim(), 10) : null,
          length: columns[6]?.trim() || null,
          width: columns[7]?.trim() || null,
          units: columns[8]?.trim() || null,
          unitPrice: columns[9]?.trim() || null,
          adjUnitPrice: columns[10]?.trim() || null,
          pctComp: columns[11]?.trim() || null,
          actYr: columns[12] ? parseInt(columns[12].trim(), 10) : null,
          effYr: columns[13] ? parseInt(columns[13].trim(), 10) : null,
          rollYr: columns[14] ? parseInt(columns[14].trim(), 10) : null,
          dt: columns[15]?.trim() || null,
          pctCond: columns[16]?.trim() || null,
          dprVal: columns[17]?.trim() || null,
          note: columns[18]?.trim() || null,
          asdVal: columns[19]?.trim() || null,
        };

        if (!record.acct) {
          console.warn(`Skipping record due to missing acct on line: ${count + 1}`);
          continue;
        }

        if (existingAccountIds.has(record.acct)) {
          skippedExistingCount++;
          if (count % 100 === 0) {
            updateProgress();
          }
          continue;
        }

        recordBatch.push(record);

        if (recordBatch.length >= BATCH_SIZE) {
          await processBatch();
          updateProgress();
        } else if (count % 100 === 0) {
          updateProgress();
        }
      }

      await processBatch();
      updateProgress();
      process.stdout.write('\n');

      console.log(`\nFile ${fileName} processing completed!`);
      console.log(`Total records processed: ${count}`);
      console.log(`Successfully inserted: ${successCount}`);
      console.log(`Skipped (already existing): ${skippedExistingCount}`);
      console.log(`Failed to insert: ${errorCount}`);
    }

  } catch (error) {
    console.error("Error loading extra features detail data:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
loadExtraFeaturesDetail(); 
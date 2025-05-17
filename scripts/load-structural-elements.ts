import { createReadStream, readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { structuralElements } from '../src/drizzle/schema';
import { config } from 'dotenv';

config();

// Function to find the latest data folder
const getLatestDataPath = (baseDir: string, fileName: string) => {
  const directories = readdirSync(baseDir)
    .map(name => join(baseDir, name))
    .filter(source => statSync(source).isDirectory())
    .filter(source => /\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(source)) // Filter by YYYY-MM-DD_HH-MM-SS pattern
    .sort((a, b) => {
      const aStat = statSync(a);
      const bStat = statSync(b);
      // Sort by name (timestamp) to get the latest, as mtime might not be reliable if folders are touched
      return b.localeCompare(a);
    });

  if (directories.length === 0) {
    throw new Error(`No timestamped data folders found in ${baseDir}`);
  }
  const latestDir = directories[0];
  const targetFilePath = join(latestDir, fileName);
  console.log(`Using data file: ${targetFilePath}`);
  return targetFilePath;
};

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool);

const BATCH_SIZE = 1000;
const LOG_FILE_PATH = join(process.cwd(), 'scripts/processed_structural_elements.log');

// Helper function to read the log file
const readProcessedFilesLog = (): Set<string> => {
  if (!existsSync(LOG_FILE_PATH)) {
    return new Set();
  }
  try {
    const data = readFileSync(LOG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
    return new Set();
  } catch (error) {
    console.warn("Warning: Could not read or parse processed files log. Starting fresh.", error);
    return new Set();
  }
};

// Helper function to add a file to the log
const addFileToProcessedLog = (filePath: string, processedFiles: Set<string>) => {
  processedFiles.add(filePath);
  try {
    writeFileSync(LOG_FILE_PATH, JSON.stringify(Array.from(processedFiles)), 'utf-8');
  } catch (error) {
    console.error(`Error: Could not write to processed files log for ${filePath}.`, error);
  }
};

async function loadStructuralElements() {
  const baseDataDir = join(process.cwd(), "src/lib/property-analysis/data");
  const filesToProcess = [
    getLatestDataPath(baseDataDir, 'structural_elem1.txt'),
    getLatestDataPath(baseDataDir, 'structural_elem2.txt')
  ];

  let totalProcessed = 0;
  let totalInserted = 0;
  let failedInserts = 0;

  const processedFilesLog = readProcessedFilesLog();

  for (const filePath of filesToProcess) {
    if (processedFilesLog.has(filePath)) {
      console.log(`\nFile ${filePath} has already been processed. Skipping.`);
      continue;
    }

    console.log(`\nProcessing file: ${filePath}`);
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let recordBatch: typeof structuralElements.$inferInsert[] = [];
    let isFirstLine = true;
    let headers: string[] = [];
    let linesInFileProcessed = 0;

    const processBatch = async () => {
      if (recordBatch.length === 0) return;
      try {
        await db.insert(structuralElements).values(recordBatch).onConflictDoNothing();
        totalInserted += recordBatch.length;
      } catch (batchError) {
        console.error(`\nError inserting batch for file ${filePath}:`, batchError);
        failedInserts += recordBatch.length; // This might overcount if script stops before file completion
                                         // For robust resumable, failedInserts should be reset per file or handled differently
                                         // But for now, we focus on skipping completed files.
        throw batchError; // Re-throw to stop processing if a batch fails, so file isn't marked complete
      }
      recordBatch = [];
    };

    try {
      for await (const line of rl) {
        totalProcessed++; 
        linesInFileProcessed++;

        if (isFirstLine) {
          headers = line.split('\t').map(h => h.trim());
          isFirstLine = false;
          continue;
        }

        const values = line.split('\t').map(v => v.trim());
        const structuralElement = {
          acct: values[headers.indexOf('acct')],
          bldNum: values[headers.indexOf('bld_num')],
          code: values[headers.indexOf('code')],
          adj: values[headers.indexOf('adj')] || null,
          type: values[headers.indexOf('type')],
          typeDscr: values[headers.indexOf('type_dscr')],
          categoryDscr: values[headers.indexOf('category_dscr')],
          dorCd: values[headers.indexOf('dor_cd')],
        };

        recordBatch.push(structuralElement);

        if (recordBatch.length >= BATCH_SIZE) {
          await processBatch();
        }

        if (linesInFileProcessed % 100 === 0) {
          process.stdout.write(
            `File: ${filePath.substring(filePath.lastIndexOf('/') + 1)} | Processed: ${linesInFileProcessed} | Inserted (total): ${totalInserted} | Failed (total): ${failedInserts}\r`
          );
        }
      }

      await processBatch(); // Process any remaining records for the current file
      process.stdout.write('\n'); 
      console.log(`Successfully finished processing ${filePath}. Lines in file: ${linesInFileProcessed}`);
      addFileToProcessedLog(filePath, processedFilesLog); // Mark file as complete in the log

    } catch (error) {
      process.stdout.write('\n');
      console.error(`Error processing file ${filePath}:`, error);
      console.log("Aborting further processing. Please check the error and restart the script.");
      console.log("The current file will be reprocessed on next run unless manually added to processed_structural_elements.log");
      break; // Stop processing further files if one fails catastrophically mid-file
    } finally {
      await new Promise(resolve => fileStream.close(resolve));
    }
  }

  console.log(`\nFinal Summary:`);
  console.log(`Total records processed across all files: ${totalProcessed}`);
  console.log(`Successfully inserted (total): ${totalInserted}`);
  console.log(`Failed inserts (total): ${failedInserts}`);
}

loadStructuralElements()
  .catch(console.error)
  .finally(() => pool.end()); 
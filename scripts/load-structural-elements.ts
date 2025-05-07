import { createReadStream } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { structuralElements } from '../src/drizzle/schema';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool);

async function loadStructuralElements() {
  const files = [
    'src/lib/property-analysis/data/Real_building_land/structural_elem1.txt',
    'src/lib/property-analysis/data/Real_building_land/structural_elem2.txt'
  ];

  let totalProcessed = 0;
  let totalInserted = 0;
  let failedInserts = 0;

  for (const filePath of files) {
    console.log(`Processing file: ${filePath}`);
    const fullPath = join(process.cwd(), filePath);
    const fileStream = createReadStream(fullPath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isFirstLine = true;
    let headers: string[] = [];

    for await (const line of rl) {
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

      try {
        await db.insert(structuralElements).values(structuralElement).onConflictDoNothing();
        totalInserted++;
      } catch (error) {
        console.error('Error inserting record:', error);
        console.error('Failed record:', structuralElement);
        failedInserts++;
      }

      totalProcessed++;
      if (totalProcessed % 100 === 0) {
        console.log(`Processed ${totalProcessed} records. Inserted: ${totalInserted}, Failed: ${failedInserts}`);
      }
    }

    await new Promise(resolve => fileStream.close(resolve));
  }

  console.log(`\nFinal Summary:`);
  console.log(`Total records processed: ${totalProcessed}`);
  console.log(`Successfully inserted: ${totalInserted}`);
  console.log(`Failed inserts: ${failedInserts}`);
}

loadStructuralElements()
  .catch(console.error)
  .finally(() => pool.end()); 
// scripts/generate_chump_json.js
import { getCollection } from 'astro:content';
import { writeFile } from 'node:fs/promises';
import { getChumpJson } from '../src/utils/getChumps.js';

async function generate() {
  try {
    // Get data using Astro's content collections
    const chumps = await getCollection('chumps');
    
    // Process your data (you may need to adapt this part)
    const enrichedData = await enrichChumpData(chumps);
    const json = getChumpJson(enrichedData);
    
    // Write to file
    await writeFile('./src/data/chumps.json', json);
    console.log('Chump data generated successfully!');
  } catch (error) {
    console.error('Error generating chump data:', error);
    process.exit(1);
  }
}

// You'll need to include or adapt your enrichment functions here
async function enrichChumpData(chumps) {
  // Your enrichment logic here
  return { chumps };
}

generate();
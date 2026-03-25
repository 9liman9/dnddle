/**
 * Fetches bestiary data from 5etools-mirror-3/5etools-src GitHub repo.
 * Run with: npx tsx scripts/fetch-data.ts
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/bestiary';
const RAW_DIR = join(process.cwd(), 'scripts', 'raw');

// Index file that lists all bestiary sources
const INDEX_URL = `${BASE_URL}/index.json`;

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function main() {
  if (!existsSync(RAW_DIR)) {
    mkdirSync(RAW_DIR, { recursive: true });
  }

  console.log('Fetching bestiary index...');
  const index = (await fetchJSON(INDEX_URL)) as Record<string, string>;

  const files = Object.values(index);
  console.log(`Found ${files.length} bestiary files`);

  let totalMonsters = 0;
  const allMonsters: unknown[] = [];

  for (const file of files) {
    const url = `${BASE_URL}/${file}`;
    console.log(`  Fetching ${file}...`);
    try {
      const data = (await fetchJSON(url)) as { monster?: unknown[] };
      if (data.monster) {
        allMonsters.push(...data.monster);
        totalMonsters += data.monster.length;
      }
    } catch (err) {
      console.warn(`  Warning: Failed to fetch ${file}, skipping. Error: ${err}`);
    }
  }

  const outPath = join(RAW_DIR, 'all-monsters-raw.json');
  writeFileSync(outPath, JSON.stringify(allMonsters, null, 2));
  console.log(`\nSaved ${totalMonsters} raw monsters to ${outPath}`);

  // Fetch fluff (lore) files
  console.log('\nFetching fluff/lore files...');
  const allFluff: unknown[] = [];
  let fluffCount = 0;

  for (const file of files) {
    const fluffFile = file.replace('bestiary-', 'fluff-bestiary-');
    const url = `${BASE_URL}/${fluffFile}`;
    try {
      const data = (await fetchJSON(url)) as { monsterFluff?: unknown[] };
      if (data.monsterFluff) {
        allFluff.push(...data.monsterFluff);
        fluffCount += data.monsterFluff.length;
      }
    } catch {
      // Not all sources have fluff files — that's fine
    }
  }

  const fluffPath = join(RAW_DIR, 'all-fluff-raw.json');
  writeFileSync(fluffPath, JSON.stringify(allFluff, null, 2));
  console.log(`Saved ${fluffCount} fluff entries to ${fluffPath}`);
  console.log('\nDone!');
}

main().catch(console.error);

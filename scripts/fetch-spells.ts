/**
 * Fetches spell data from 5etools-mirror-3/5etools-src GitHub repo.
 * Run with: npx tsx scripts/fetch-spells.ts
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells';
const RAW_DIR = join(process.cwd(), 'scripts', 'raw');

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function main() {
  if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true });

  console.log('Fetching spell index...');
  const index = (await fetchJSON(`${BASE_URL}/index.json`)) as Record<string, string>;
  const files = Object.values(index);
  console.log(`Found ${files.length} spell files`);

  const allSpells: unknown[] = [];
  for (const file of files) {
    const url = `${BASE_URL}/${file}`;
    console.log(`  Fetching ${file}...`);
    try {
      const data = (await fetchJSON(url)) as { spell?: unknown[] };
      if (data.spell) allSpells.push(...data.spell);
    } catch (err) {
      console.warn(`  Warning: Failed to fetch ${file}, skipping.`);
    }
  }

  const outPath = join(RAW_DIR, 'all-spells-raw.json');
  writeFileSync(outPath, JSON.stringify(allSpells, null, 2));
  console.log(`\nDone! Saved ${allSpells.length} raw spells to ${outPath}`);
}

main().catch(console.error);

/**
 * Processes raw 5etools monster data into game-ready format.
 * Run with: npx tsx scripts/process-data.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface RawMonster {
  name: string;
  source: string;
  size?: string[];
  type?: string | { type: string; tags?: unknown[] };
  cr?: string | { cr: string } | number;
  alignment?: Array<{ alignment: string[] } | string>;
  environment?: string[];
  speed?: Record<string, unknown>;
  senses?: string[];
  hasToken?: boolean;
  trait?: unknown[];
  action?: unknown[];
  ac?: Array<number | { ac: number; from?: string[] }>;
  hp?: { average?: number; formula?: string };
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  languages?: string[];
  _copy?: unknown;
}

interface ProcessedMonster {
  id: number;
  name: string;
  source: string;
  sourceFull: string;
  size: string;
  type: string;
  cr: number;
  alignment: { law: string; moral: string } | 'unaligned';
  biomes: string[];
  movement: string[];
  senses: string[];
  hasToken: boolean;
  tokenUrl?: string;
  artworkUrl?: string;
  lore?: string;
  traits?: string[];
  ac?: number;
  acFrom?: string;
  hp?: number;
  hpFormula?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  languages?: string[];
  actions?: string[];
}

// Source abbreviation → full name
const SOURCE_MAP: Record<string, string> = {
  MM: 'Monster Manual',
  PHB: "Player's Handbook",
  DMG: "Dungeon Master's Guide",
  VGM: "Volo's Guide to Monsters",
  MTF: "Mordenkainen's Tome of Foes",
  MPMM: "Mordenkainen Presents: Monsters of the Multiverse",
  XGE: "Xanathar's Guide to Everything",
  TCE: "Tasha's Cauldron of Everything",
  FTD: "Fizban's Treasury of Dragons",
  CoS: 'Curse of Strahd',
  ToA: 'Tomb of Annihilation',
  SKT: 'Storm King\'s Thunder',
  OotA: 'Out of the Abyss',
  PotA: 'Princes of the Apocalypse',
  HotDQ: 'Hoard of the Dragon Queen',
  RoT: 'Rise of Tiamat',
  GoS: 'Ghosts of Saltmarsh',
  BGG: "Bigby Presents: Glory of the Giants",
  GGR: "Guildmasters' Guide to Ravnica",
  EGW: "Explorer's Guide to Wildemount",
  ERLW: 'Eberron: Rising from the Last War',
  MOT: 'Mythic Odysseys of Theros',
  VRGR: "Van Richten's Guide to Ravenloft",
  IDRotF: 'Icewind Dale: Rime of the Frostmaiden',
  WBtW: 'The Wild Beyond the Witchlight',
  SCC: 'Strixhaven: A Curriculum of Chaos',
  DSotDQ: 'Dragonlance: Shadow of the Dragon Queen',
  BAM: 'Boo\'s Astral Menagerie',
  ToFW: 'Tyranny of the Waves',
  BMT: 'The Book of Many Things',
  CoA: 'Chains of Asmodeus',
  BGDIA: "Baldur's Gate: Descent into Avernus",
  WDH: 'Waterdeep: Dragon Heist',
  WDMM: 'Waterdeep: Dungeon of the Mad Mage',
  TftYP: 'Tales from the Yawning Portal',
  LMoP: 'Lost Mine of Phandelver',
  PaBTSO: "Phandelver and Below: The Shattered Obelisk",
  CM: 'Candlekeep Mysteries',
  VEOR: 'Vecna: Eve of Ruin',
  XMM: '2024 Monster Manual',
  XPHB: "2024 Player's Handbook",
  XDMG: "2024 Dungeon Master's Guide",
};

const IMG_BASE = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-img/main/bestiary';

function buildImageUrls(name: string, source: string, hasToken: boolean) {
  // URL-encode the monster name for spaces and special chars
  const encoded = encodeURIComponent(name);
  return {
    tokenUrl: hasToken ? `${IMG_BASE}/tokens/${source}/${encoded}.webp` : undefined,
    artworkUrl: `${IMG_BASE}/${source}/${encoded}.webp`,
  };
}

const SIZE_MAP: Record<string, string> = {
  T: 'Tiny',
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  H: 'Huge',
  G: 'Gargantuan',
};

const CR_FRACTIONS: Record<string, number> = {
  '0': 0,
  '1/8': 0.125,
  '1/4': 0.25,
  '1/2': 0.5,
};

function parseSize(raw: string[] | undefined): string {
  if (!raw || raw.length === 0) return 'Medium';
  const code = raw[0];
  return SIZE_MAP[code] || 'Medium';
}

function parseType(raw: unknown): string {
  if (!raw) return 'monstrosity';
  if (typeof raw === 'string') return raw.toLowerCase();
  if (typeof raw === 'object' && raw !== null && 'type' in raw) {
    const inner = (raw as Record<string, unknown>).type;
    if (typeof inner === 'string') return inner.toLowerCase();
    // Some entries have nested type objects — recurse
    return parseType(inner);
  }
  return 'monstrosity';
}

function parseCR(raw: string | { cr: string } | number | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number') return raw;

  let crStr: string;
  if (typeof raw === 'object' && 'cr' in raw) {
    crStr = raw.cr;
  } else {
    crStr = raw as string;
  }

  if (crStr in CR_FRACTIONS) return CR_FRACTIONS[crStr];
  const num = parseFloat(crStr);
  return isNaN(num) ? null : num;
}

function parseAlignment(raw: unknown): { law: string; moral: string } | 'unaligned' {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return 'unaligned';

  // 5etools alignment is an array of objects or strings
  // Common patterns: ["L", "E"], ["C", "G"], ["N"], ["U"]
  const flat: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      flat.push(item);
    } else if (typeof item === 'object' && item !== null) {
      if ('alignment' in item && Array.isArray((item as { alignment: string[] }).alignment)) {
        flat.push(...(item as { alignment: string[] }).alignment);
      }
    }
  }

  if (flat.includes('U') || flat.length === 0) return 'unaligned';

  // Determine law axis
  let law = 'N';
  if (flat.includes('L')) law = 'L';
  else if (flat.includes('C')) law = 'C';

  // Determine moral axis
  let moral = 'N';
  if (flat.includes('G')) moral = 'G';
  else if (flat.includes('E')) moral = 'E';

  // Handle "any alignment" / "any non-good" etc
  if (flat.includes('A')) return 'unaligned'; // "any" - treat as unaligned for game purposes

  return { law, moral };
}

function parseMovement(speed: Record<string, unknown> | undefined): string[] {
  if (!speed) return ['walk'];
  const types: string[] = [];

  for (const [key, value] of Object.entries(speed)) {
    if (key === 'canHover') continue;
    if (value === true || (typeof value === 'number' && value > 0) || typeof value === 'object') {
      types.push(key);
    }
  }

  if (speed.canHover) types.push('hover');
  return types.length > 0 ? types : ['walk'];
}

function parseSenses(raw: string[] | undefined): string[] {
  if (!raw || raw.length === 0) return [];
  const senseTypes = new Set<string>();

  for (const sense of raw) {
    const lower = sense.toLowerCase();
    if (lower.includes('darkvision')) senseTypes.add('darkvision');
    if (lower.includes('blindsight')) senseTypes.add('blindsight');
    if (lower.includes('tremorsense')) senseTypes.add('tremorsense');
    if (lower.includes('truesight')) senseTypes.add('truesight');
  }

  return Array.from(senseTypes);
}

// Recursively extract plain text from 5etools entries
function extractText(entries: unknown): string {
  if (!entries) return '';
  if (typeof entries === 'string') return entries;
  if (Array.isArray(entries)) return entries.map(extractText).filter(Boolean).join(' ');
  if (typeof entries === 'object' && entries !== null) {
    const obj = entries as Record<string, unknown>;
    if (obj.entries) return extractText(obj.entries);
    if (obj.text) return String(obj.text);
  }
  return '';
}

function main() {
  const rawPath = join(process.cwd(), 'scripts', 'raw', 'all-monsters-raw.json');
  if (!existsSync(rawPath)) {
    console.error('Raw data not found. Run fetch-data first: npx tsx scripts/fetch-data.ts');
    process.exit(1);
  }

  console.log('Reading raw monster data...');
  const rawMonsters: RawMonster[] = JSON.parse(readFileSync(rawPath, 'utf-8'));

  // Load fluff/lore data
  const fluffPath = join(process.cwd(), 'scripts', 'raw', 'all-fluff-raw.json');
  const fluffMap = new Map<string, string>();
  if (existsSync(fluffPath)) {
    console.log('Reading fluff/lore data...');
    const fluffData: Array<{ name: string; source: string; entries?: unknown }> =
      JSON.parse(readFileSync(fluffPath, 'utf-8'));

    for (const fluff of fluffData) {
      const fullText = extractText(fluff.entries);
      if (fullText.length > 20) {
        // Take first 2 sentences as lore hint
        const sentences = fullText.match(/[^.!?]+[.!?]+/g);
        const lore = sentences ? sentences.slice(0, 2).join('').trim() : fullText.slice(0, 200);
        fluffMap.set(`${fluff.name}|${fluff.source}`, lore);
      }
    }
    console.log(`  Loaded ${fluffMap.size} lore entries`);
  }

  console.log(`Processing ${rawMonsters.length} raw entries...`);

  const processed: ProcessedMonster[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (const raw of rawMonsters) {
    if (raw._copy) { skipped++; continue; }

    const key = raw.name.toLowerCase();
    if (seen.has(key)) { skipped++; continue; }
    seen.add(key);

    const cr = parseCR(raw.cr);
    if (cr === null) { skipped++; continue; }

    const hasTokenFlag = raw.hasToken || false;
    const { tokenUrl, artworkUrl } = buildImageUrls(raw.name, raw.source, hasTokenFlag);

    // Extract trait names
    const traits: string[] = [];
    if (raw.trait && Array.isArray(raw.trait)) {
      for (const t of raw.trait) {
        if (typeof t === 'object' && t !== null && 'name' in t) {
          traits.push(String((t as { name: string }).name));
        }
      }
    }

    // Extract action names
    const actions: string[] = [];
    if (raw.action && Array.isArray(raw.action)) {
      for (const a of raw.action) {
        if (typeof a === 'object' && a !== null && 'name' in a) {
          actions.push(String((a as { name: string }).name));
        }
      }
    }

    // Parse AC
    let ac: number | undefined;
    let acFrom: string | undefined;
    if (raw.ac && Array.isArray(raw.ac) && raw.ac.length > 0) {
      const first = raw.ac[0];
      if (typeof first === 'number') {
        ac = first;
      } else if (typeof first === 'object' && first !== null && 'ac' in first) {
        ac = (first as { ac: number; from?: string[] }).ac;
        const fromArr = (first as { from?: string[] }).from;
        if (fromArr) acFrom = fromArr.join(', ');
      }
    }

    const monster: ProcessedMonster = {
      id: processed.length,
      name: raw.name,
      source: raw.source,
      sourceFull: SOURCE_MAP[raw.source] || raw.source,
      size: parseSize(raw.size),
      type: parseType(raw.type),
      cr,
      alignment: parseAlignment(raw.alignment),
      biomes: raw.environment || [],
      movement: parseMovement(raw.speed),
      senses: parseSenses(raw.senses),
      hasToken: hasTokenFlag,
      tokenUrl,
      artworkUrl,
      lore: fluffMap.get(`${raw.name}|${raw.source}`),
      traits: traits.length > 0 ? traits : undefined,
      ac,
      acFrom,
      hp: raw.hp?.average,
      hpFormula: raw.hp?.formula,
      str: raw.str,
      dex: raw.dex,
      con: raw.con,
      int: raw.int,
      wis: raw.wis,
      cha: raw.cha,
      languages: raw.languages && raw.languages.length > 0 ? raw.languages : undefined,
      actions: actions.length > 0 ? actions : undefined,
    };

    processed.push(monster);
  }

  // Sort by name for consistent ordering (important for daily seed)
  processed.sort((a, b) => a.name.localeCompare(b.name));

  // Reassign IDs after sorting
  processed.forEach((m, i) => { m.id = i; });

  const outPath = join(process.cwd(), 'public', 'data', 'monsters.json');
  writeFileSync(outPath, JSON.stringify(processed));

  console.log(`\nDone!`);
  console.log(`  Processed: ${processed.length} monsters`);
  console.log(`  Skipped: ${skipped} (copies, duplicates, no CR)`);
  console.log(`  Output: ${outPath}`);

  // Stats
  const types = new Map<string, number>();
  for (const m of processed) {
    types.set(m.type, (types.get(m.type) || 0) + 1);
  }
  console.log(`\nType distribution:`);
  for (const [type, count] of [...types.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
}

main();

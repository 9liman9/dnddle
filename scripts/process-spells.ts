/**
 * Processes raw 5etools spell data into game-ready format.
 * Run with: npx tsx scripts/process-spells.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface RawSpell {
  name: string;
  source: string;
  level: number;
  school: string;
  time?: Array<{ number: number; unit: string }>;
  range?: { type: string; distance?: { type: string; amount?: number } };
  components?: { v?: boolean; s?: boolean; m?: unknown };
  duration?: Array<{ type: string; duration?: { type: string; amount: number }; concentration?: boolean }>;
  entries?: unknown[];
  damageInflict?: string[];
  savingThrow?: string[];
  hasFluffImages?: boolean;
  _copy?: unknown;
}

interface ProcessedSpell {
  id: number;
  name: string;
  source: string;
  sourceFull: string;
  level: number;
  school: string;
  schoolFull: string;
  castingTime: string;
  range: string;
  components: string;
  materialText?: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  damageType?: string;
  description?: string;
  artworkUrl?: string;
}

const SPELL_IMG_BASE = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-img/main/spells';

function extractText(entries: unknown): string {
  if (!entries) return '';
  if (typeof entries === 'string') {
    // Strip 5etools tags like {@damage 8d6}, {@spell fireball}, etc.
    return entries.replace(/\{@\w+\s+([^}|]+?)(?:\|[^}]*)?\}/g, '$1');
  }
  if (Array.isArray(entries)) return entries.map(extractText).filter(Boolean).join(' ');
  if (typeof entries === 'object' && entries !== null) {
    const obj = entries as Record<string, unknown>;
    if (obj.entries) return extractText(obj.entries);
    if (obj.text) return String(obj.text);
  }
  return '';
}

const SCHOOL_MAP: Record<string, string> = {
  A: 'Abjuration',
  C: 'Conjuration',
  D: 'Divination',
  E: 'Enchantment',
  I: 'Illusion',
  N: 'Necromancy',
  T: 'Transmutation',
  V: 'Evocation',
};

const SOURCE_MAP: Record<string, string> = {
  PHB: "Player's Handbook",
  XGE: "Xanathar's Guide to Everything",
  TCE: "Tasha's Cauldron of Everything",
  XPHB: "2024 Player's Handbook",
  EGW: "Explorer's Guide to Wildemount",
  AI: "Acquisitions Incorporated",
  FTD: "Fizban's Treasury of Dragons",
  GGR: "Guildmasters' Guide to Ravnica",
  IDRotF: "Icewind Dale: Rime of the Frostmaiden",
  SCC: "Strixhaven: A Curriculum of Chaos",
  BMT: "The Book of Many Things",
};

function parseCastingTime(time: RawSpell['time']): string {
  if (!time || time.length === 0) return 'Unknown';
  const t = time[0];
  if (t.number === 1 && t.unit === 'action') return '1 Action';
  if (t.number === 1 && t.unit === 'bonus') return '1 Bonus Action';
  if (t.number === 1 && t.unit === 'reaction') return '1 Reaction';
  if (t.unit === 'minute') return `${t.number} Minute${t.number > 1 ? 's' : ''}`;
  if (t.unit === 'hour') return `${t.number} Hour${t.number > 1 ? 's' : ''}`;
  return `${t.number} ${t.unit}`;
}

function parseRange(range: RawSpell['range']): string {
  if (!range) return 'Unknown';
  if (range.type === 'point') {
    if (!range.distance) return 'Special';
    if (range.distance.type === 'self') return 'Self';
    if (range.distance.type === 'touch') return 'Touch';
    if (range.distance.type === 'sight') return 'Sight';
    if (range.distance.type === 'unlimited') return 'Unlimited';
    return `${range.distance.amount} ${range.distance.type}`;
  }
  if (range.type === 'special') return 'Special';
  // Cone, line, sphere, etc.
  if (range.distance) {
    return `Self (${range.distance.amount} ${range.distance.type} ${range.type})`;
  }
  return range.type;
}

function parseComponents(comp: RawSpell['components']): string {
  if (!comp) return '—';
  const parts: string[] = [];
  if (comp.v) parts.push('V');
  if (comp.s) parts.push('S');
  if (comp.m) parts.push('M');
  return parts.join(', ') || '—';
}

function parseDuration(dur: RawSpell['duration']): { text: string; concentration: boolean } {
  if (!dur || dur.length === 0) return { text: 'Unknown', concentration: false };
  const d = dur[0];
  const conc = d.concentration || false;
  if (d.type === 'instant') return { text: 'Instantaneous', concentration: false };
  if (d.type === 'permanent') return { text: 'Permanent', concentration: false };
  if (d.type === 'special') return { text: 'Special', concentration: conc };
  if (d.duration) {
    const amt = d.duration.amount;
    const unit = d.duration.type;
    const label = `${amt} ${unit}${amt > 1 ? 's' : ''}`;
    return { text: conc ? `Concentration, ${label}` : label, concentration: conc };
  }
  return { text: d.type, concentration: conc };
}

function main() {
  const rawPath = join(process.cwd(), 'scripts', 'raw', 'all-spells-raw.json');
  if (!existsSync(rawPath)) {
    console.error('Raw spell data not found. Run fetch-spells first.');
    process.exit(1);
  }

  console.log('Reading raw spell data...');
  const rawSpells: RawSpell[] = JSON.parse(readFileSync(rawPath, 'utf-8'));
  console.log(`Processing ${rawSpells.length} raw spells...`);

  const processed: ProcessedSpell[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (const raw of rawSpells) {
    if (raw._copy) { skipped++; continue; }
    const key = raw.name.toLowerCase();
    if (seen.has(key)) { skipped++; continue; }
    seen.add(key);

    const dur = parseDuration(raw.duration);

    // Extract description (first 2 sentences)
    const fullDesc = extractText(raw.entries);
    let description: string | undefined;
    if (fullDesc.length > 20) {
      const sentences = fullDesc.match(/[^.!?]+[.!?]+/g);
      description = sentences ? sentences.slice(0, 2).join('').trim() : fullDesc.slice(0, 250);
    }

    // Extract material component text
    let materialText: string | undefined;
    if (raw.components?.m) {
      if (typeof raw.components.m === 'string') materialText = raw.components.m;
      else if (typeof raw.components.m === 'object' && raw.components.m !== null && 'text' in (raw.components.m as Record<string, unknown>)) {
        materialText = String((raw.components.m as Record<string, unknown>).text);
      }
    }

    // Artwork URL
    const encoded = encodeURIComponent(raw.name);
    const artworkUrl = `${SPELL_IMG_BASE}/${raw.source}/${encoded}.webp`;

    const spell: ProcessedSpell = {
      id: processed.length,
      name: raw.name,
      source: raw.source,
      sourceFull: SOURCE_MAP[raw.source] || raw.source,
      level: raw.level,
      school: raw.school,
      schoolFull: SCHOOL_MAP[raw.school] || raw.school,
      castingTime: parseCastingTime(raw.time),
      range: parseRange(raw.range),
      components: parseComponents(raw.components),
      materialText,
      duration: dur.text,
      concentration: dur.concentration,
      ritual: false,
      damageType: raw.damageInflict?.[0],
      description,
      artworkUrl: raw.hasFluffImages ? artworkUrl : undefined,
    };

    processed.push(spell);
  }

  processed.sort((a, b) => a.name.localeCompare(b.name));
  processed.forEach((s, i) => { s.id = i; });

  const outPath = join(process.cwd(), 'public', 'data', 'spells.json');
  writeFileSync(outPath, JSON.stringify(processed));

  console.log(`\nDone!`);
  console.log(`  Processed: ${processed.length} spells`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Output: ${outPath}`);

  // Stats
  const schools = new Map<string, number>();
  const levels = new Map<number, number>();
  for (const s of processed) {
    schools.set(s.schoolFull, (schools.get(s.schoolFull) || 0) + 1);
    levels.set(s.level, (levels.get(s.level) || 0) + 1);
  }
  console.log(`\nSchool distribution:`);
  for (const [school, count] of [...schools.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${school}: ${count}`);
  }
  console.log(`\nLevel distribution:`);
  for (const [level, count] of [...levels.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${level === 0 ? 'Cantrip' : `Level ${level}`}: ${count}`);
  }
}

main();

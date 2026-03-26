// cyrb53 hash - fast, good distribution
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Per-mode seeds — different monster for each mode
const MODE_SEEDS: Record<string, number> = {
  classic: 122,
  artwork: 337,
  emoji: 444,
  spelldle: 999,
};

export function getDailyMonsterIndex(totalMonsters: number, date?: Date, mode = 'classic'): number {
  const dateStr = getDateString(date);
  const seed = MODE_SEEDS[mode] ?? 122;
  const hash = cyrb53(dateStr, seed);
  return hash % totalMonsters;
}

// Day number since launch (for "Monster-dle #42" display)
const LAUNCH_DATE = new Date('2026-03-25');

export function getDailyNumber(date: Date = new Date()): number {
  const diff = date.getTime() - LAUNCH_DATE.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

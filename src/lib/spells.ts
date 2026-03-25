import type { Spell } from '../types/spell';

let spellsCache: Spell[] | null = null;

export async function loadSpells(): Promise<Spell[]> {
  if (spellsCache) return spellsCache;
  const response = await fetch('/data/spells.json');
  const data: Spell[] = await response.json();
  spellsCache = data;
  return data;
}

export function searchSpells(spells: Spell[], query: string): Spell[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase().trim();
  return spells
    .filter(s => s.name.toLowerCase().includes(lower))
    .slice(0, 50);
}

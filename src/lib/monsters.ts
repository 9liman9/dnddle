import type { Monster } from '../types';

let monstersCache: Monster[] | null = null;

export async function loadMonsters(): Promise<Monster[]> {
  if (monstersCache) return monstersCache;

  const response = await fetch('/data/monsters.json');
  const data: Monster[] = await response.json();
  monstersCache = data;
  return data;
}

export function searchMonsters(monsters: Monster[], query: string): Monster[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase().trim();
  return monsters
    .filter(m => m.name.toLowerCase().includes(lower))
    .slice(0, 50); // Cap results for performance
}

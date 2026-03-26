import type { Monster } from '../types';

export type Difficulty = 'easy' | 'normal' | 'hard';

// Core sourcebooks for each difficulty
const EASY_SOURCES = new Set(['MM', 'XMM']);
const NORMAL_SOURCES = new Set(['MM', 'XMM', 'VGM', 'MTF', 'MPMM', 'FTD', 'BGG']);

export function filterByDifficulty(monsters: Monster[], difficulty: Difficulty): Monster[] {
  switch (difficulty) {
    case 'easy':
      return monsters.filter(m => EASY_SOURCES.has(m.source));
    case 'normal':
      return monsters.filter(m => NORMAL_SOURCES.has(m.source));
    case 'hard':
      return monsters;
  }
}

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string }> = {
  easy: { label: 'Easy', desc: 'Monster Manual only' },
  normal: { label: 'Normal', desc: 'Core + supplements' },
  hard: { label: 'Hard', desc: 'All sources' },
};

export function getDifficultyCount(monsters: Monster[], difficulty: Difficulty): number {
  return filterByDifficulty(monsters, difficulty).length;
}

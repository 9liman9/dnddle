export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type CreatureType =
  | 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon'
  | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid'
  | 'monstrosity' | 'ooze' | 'plant' | 'undead';

export interface Alignment {
  law: 'L' | 'N' | 'C';
  moral: 'G' | 'N' | 'E';
}

export interface Monster {
  id: number;
  name: string;
  source: string;
  size: Size;
  type: CreatureType;
  cr: number;
  alignment: Alignment | 'unaligned';
  biomes: string[];
  movement: string[];
  senses: string[];
  hasToken: boolean;
  tokenUrl?: string;
  artworkUrl?: string;
  sourceFull: string;
  lore?: string;
  traits?: string[];
  // Stat block fields
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
  soundClip?: string;
}

export type GameMode = 'classic' | 'artwork' | 'spelldle';

export interface NameGuess {
  name: string;
  correct: boolean;
  tokenUrl?: string;
}

export type FeedbackType = 'match' | 'partial' | 'wrong' | 'higher' | 'lower';

export interface CellFeedback {
  value: string;
  fullValue?: string;
  feedback: FeedbackType;
}

export interface GuessFeedback {
  monster: Monster;
  cells: {
    size: CellFeedback;
    type: CellFeedback;
    cr: CellFeedback;
    alignment: CellFeedback;
    biome: CellFeedback;
    movement: CellFeedback;
    senses: CellFeedback;
  };
}

export interface GameState {
  dailyNumber: number;
  guesses: GuessFeedback[];
  solved: boolean;
  gaveUp: boolean;
  startTime: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedDate: string;
}

export interface Spell {
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
  duration: string;
  concentration: boolean;
  ritual: boolean;
  damageType?: string;
}

export interface SpellCellFeedback {
  value: string;
  feedback: 'match' | 'partial' | 'wrong' | 'higher' | 'lower';
}

export interface SpellGuessFeedback {
  spell: Spell;
  cells: {
    level: SpellCellFeedback;
    school: SpellCellFeedback;
    castingTime: SpellCellFeedback;
    range: SpellCellFeedback;
    components: SpellCellFeedback;
    duration: SpellCellFeedback;
    concentration: SpellCellFeedback;
  };
}

import type { Spell, SpellGuessFeedback, SpellCellFeedback } from '../types/spell';

function compareLevel(guess: number, answer: number): SpellCellFeedback {
  const label = guess === 0 ? 'Cantrip' : `Lvl ${guess}`;
  if (guess === answer) return { value: label, feedback: 'match' };
  return { value: label, feedback: answer > guess ? 'higher' : 'lower' };
}

function compareSchool(guess: string, answer: string): SpellCellFeedback {
  return { value: guess, feedback: guess === answer ? 'match' : 'wrong' };
}

function compareCastingTime(guess: string, answer: string): SpellCellFeedback {
  if (guess === answer) return { value: guess, feedback: 'match' };
  // Partial if same base type (both actions, both minutes, etc.)
  const guessBase = guess.replace(/\d+\s*/, '').toLowerCase();
  const answerBase = answer.replace(/\d+\s*/, '').toLowerCase();
  if (guessBase === answerBase) return { value: guess, feedback: 'partial' };
  return { value: guess, feedback: 'wrong' };
}

function compareRange(guess: string, answer: string): SpellCellFeedback {
  if (guess === answer) return { value: guess, feedback: 'match' };
  // Partial if both are distance-based
  const guessFeet = extractFeet(guess);
  const answerFeet = extractFeet(answer);
  if (guessFeet !== null && answerFeet !== null) {
    return { value: guess, feedback: answerFeet > guessFeet ? 'higher' : 'lower' };
  }
  if (guess === 'Self' && answer.startsWith('Self')) return { value: guess, feedback: 'partial' };
  return { value: guess, feedback: 'wrong' };
}

function extractFeet(range: string): number | null {
  const match = range.match(/(\d+)\s*feet/);
  return match ? parseInt(match[1]) : null;
}

function compareComponents(guess: string, answer: string): SpellCellFeedback {
  if (guess === answer) return { value: guess, feedback: 'match' };
  const guessParts = new Set(guess.split(', '));
  const answerParts = new Set(answer.split(', '));
  const overlap = [...guessParts].some(p => answerParts.has(p));
  return { value: guess, feedback: overlap ? 'partial' : 'wrong' };
}

function compareDuration(guess: string, answer: string): SpellCellFeedback {
  if (guess === answer) return { value: guess, feedback: 'match' };
  // Partial if both concentration, etc.
  if (guess.includes('Concentration') && answer.includes('Concentration')) {
    return { value: guess, feedback: 'partial' };
  }
  return { value: guess, feedback: 'wrong' };
}

function compareConcentration(guess: boolean, answer: boolean): SpellCellFeedback {
  return {
    value: guess ? 'Yes' : 'No',
    feedback: guess === answer ? 'match' : 'wrong',
  };
}

export function compareSpells(guess: Spell, answer: Spell): SpellGuessFeedback {
  return {
    spell: guess,
    cells: {
      level: compareLevel(guess.level, answer.level),
      school: compareSchool(guess.schoolFull, answer.schoolFull),
      castingTime: compareCastingTime(guess.castingTime, answer.castingTime),
      range: compareRange(guess.range, answer.range),
      components: compareComponents(guess.components, answer.components),
      duration: compareDuration(guess.duration, answer.duration),
      concentration: compareConcentration(guess.concentration, answer.concentration),
    },
  };
}

import type { Monster, GuessFeedback, CellFeedback, FeedbackType, Size } from '../types';

const SIZE_ORDER: Size[] = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

function compareSize(guess: Size, answer: Size): CellFeedback {
  if (guess === answer) return { value: guess, fullValue: `Size: ${guess}`, feedback: 'match' };
  const guessIdx = SIZE_ORDER.indexOf(guess);
  const answerIdx = SIZE_ORDER.indexOf(answer);
  const dir = answerIdx > guessIdx ? 'higher' : 'lower';
  return { value: guess, fullValue: `Size: ${guess} (answer is ${dir})`, feedback: dir };
}

function compareType(guess: string, answer: string): CellFeedback {
  return {
    value: guess,
    fullValue: `Type: ${guess}`,
    feedback: guess === answer ? 'match' : 'wrong',
  };
}

function compareCR(guess: number, answer: number): CellFeedback {
  const display = formatCR(guess);
  if (guess === answer) return { value: display, fullValue: `CR: ${display}`, feedback: 'match' };
  const dir = answer > guess ? 'higher' : 'lower';
  return { value: display, fullValue: `CR: ${display} (answer is ${dir})`, feedback: dir };
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

function compareAlignment(
  guess: Monster['alignment'],
  answer: Monster['alignment']
): CellFeedback {
  const guessStr = formatAlignment(guess);

  const fullName = formatAlignmentLong(guess);

  if (guess === 'unaligned' && answer === 'unaligned') {
    return { value: guessStr, fullValue: fullName, feedback: 'match' };
  }
  if (guess === 'unaligned' || answer === 'unaligned') {
    return { value: guessStr, fullValue: fullName, feedback: 'wrong' };
  }

  const lawMatch = guess.law === answer.law;
  const moralMatch = guess.moral === answer.moral;

  if (lawMatch && moralMatch) return { value: guessStr, fullValue: fullName, feedback: 'match' };
  if (lawMatch || moralMatch) return { value: guessStr, fullValue: `${fullName} (partial match)`, feedback: 'partial' };
  return { value: guessStr, fullValue: fullName, feedback: 'wrong' };
}

function formatAlignment(alignment: Monster['alignment']): string {
  if (alignment === 'unaligned') return 'Unaligned';
  return `${alignment.law}${alignment.moral}`;
}

const LAW_NAMES: Record<string, string> = { L: 'Lawful', N: 'Neutral', C: 'Chaotic' };
const MORAL_NAMES: Record<string, string> = { G: 'Good', N: 'Neutral', E: 'Evil' };

function formatAlignmentLong(alignment: Monster['alignment']): string {
  if (alignment === 'unaligned') return 'Unaligned';
  const law = LAW_NAMES[alignment.law] || alignment.law;
  const moral = MORAL_NAMES[alignment.moral] || alignment.moral;
  if (law === 'Neutral' && moral === 'Neutral') return 'True Neutral';
  return `${law} ${moral}`;
}

function compareSets(guess: string[], answer: string[]): FeedbackType {
  if (guess.length === 0 && answer.length === 0) return 'match';
  if (guess.length === 0 || answer.length === 0) return 'wrong';

  const guessSet = new Set(guess);
  const answerSet = new Set(answer);

  const allMatch = guess.length === answer.length &&
    guess.every(g => answerSet.has(g));
  if (allMatch) return 'match';

  const someOverlap = guess.some(g => answerSet.has(g)) ||
    answer.some(a => guessSet.has(a));
  if (someOverlap) return 'partial';

  return 'wrong';
}

function truncateList(items: string[], max = 2): string {
  if (items.length === 0) return '—';
  if (items.length <= max) return items.join(', ');
  return items.slice(0, max).join(', ') + ` +${items.length - max}`;
}

function compareBiomes(guess: string[], answer: string[]): CellFeedback {
  const full = guess.length > 0 ? guess.join(', ') : '—';
  return { value: truncateList(guess), fullValue: full, feedback: compareSets(guess, answer) };
}

function compareMovement(guess: string[], answer: string[]): CellFeedback {
  const display = guess.length > 0 ? truncateList(guess) : 'Walk';
  const full = guess.length > 0 ? guess.join(', ') : 'Walk';
  return { value: display, fullValue: full, feedback: compareSets(guess, answer) };
}

function compareSenses(guess: string[], answer: string[]): CellFeedback {
  const display = truncateList(guess);
  const full = guess.length > 0 ? guess.join(', ') : '—';
  return { value: display, fullValue: full, feedback: compareSets(guess, answer) };
}

export function compareMonsters(guess: Monster, answer: Monster): GuessFeedback {
  return {
    monster: guess,
    cells: {
      size: compareSize(guess.size, answer.size),
      type: compareType(guess.type, answer.type),
      cr: compareCR(guess.cr, answer.cr),
      alignment: compareAlignment(guess.alignment, answer.alignment),
      biome: compareBiomes(guess.biomes, answer.biomes),
      movement: compareMovement(guess.movement, answer.movement),
      senses: compareSenses(guess.senses, answer.senses),
    },
  };
}

export { formatCR, formatAlignment };

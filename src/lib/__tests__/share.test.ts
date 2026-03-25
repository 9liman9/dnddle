import { describe, it, expect } from 'vitest';
import { generateShareString } from '../share';
import type { GuessFeedback } from '../../types';

function makeFeedback(feedbacks: Array<['match' | 'partial' | 'wrong' | 'higher' | 'lower']>): GuessFeedback[] {
  return feedbacks.map((row) => ({
    monster: { id: 0, name: 'Test', source: 'MM', sourceFull: 'Monster Manual', size: 'Medium', type: 'beast', cr: 1, alignment: { law: 'N', moral: 'N' }, biomes: [], movement: ['walk'], senses: [], hasToken: false },
    cells: {
      size: { value: 'M', feedback: row[0] },
      type: { value: 'beast', feedback: row[0] },
      cr: { value: '1', feedback: row[0] },
      alignment: { value: 'NN', feedback: row[0] },
      biome: { value: '-', feedback: row[0] },
      movement: { value: 'walk', feedback: row[0] },
      senses: { value: '-', feedback: row[0] },
    },
  }));
}

describe('generateShareString', () => {
  it('generates header with daily number and guess count', () => {
    const guesses = makeFeedback([['match']]);
    const result = generateShareString(guesses, 42);
    expect(result).toContain('D&Ddle #42');
    expect(result).toContain('1/∞');
  });

  it('maps match to green emoji', () => {
    const guesses = makeFeedback([['match']]);
    const result = generateShareString(guesses, 1);
    expect(result).toContain('🟩🟩🟩🟩🟩🟩🟩');
  });

  it('maps wrong to black emoji', () => {
    const guesses = makeFeedback([['wrong']]);
    const result = generateShareString(guesses, 1);
    expect(result).toContain('⬛⬛⬛⬛⬛⬛⬛');
  });

  it('maps higher/lower to white emoji', () => {
    const guesses = makeFeedback([['higher']]);
    const result = generateShareString(guesses, 1);
    expect(result).toContain('⬜⬜⬜⬜⬜⬜⬜');
  });

  it('maps partial to yellow emoji', () => {
    const guesses = makeFeedback([['partial']]);
    const result = generateShareString(guesses, 1);
    expect(result).toContain('🟨🟨🟨🟨🟨🟨🟨');
  });

  it('handles multiple rows', () => {
    const guesses = makeFeedback([['wrong'], ['partial'], ['match']]);
    const result = generateShareString(guesses, 1);
    const lines = result.split('\n');
    expect(lines).toHaveLength(4); // header + 3 rows
  });
});

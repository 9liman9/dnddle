import { describe, it, expect } from 'vitest';
import { compareMonsters, formatCR, formatAlignment } from '../compare';
import type { Monster } from '../../types';

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return {
    id: 0,
    name: 'Test Monster',
    source: 'MM',
    size: 'Medium',
    type: 'beast',
    cr: 1,
    alignment: { law: 'N', moral: 'N' },
    biomes: [],
    movement: ['walk'],
    senses: ['darkvision'],
    hasToken: false,
    sourceFull: 'Monster Manual',
    ...overrides,
  };
}

describe('compareMonsters', () => {
  it('returns all match when guess equals answer', () => {
    const monster = makeMonster();
    const result = compareMonsters(monster, monster);

    expect(result.cells.size.feedback).toBe('match');
    expect(result.cells.type.feedback).toBe('match');
    expect(result.cells.cr.feedback).toBe('match');
    expect(result.cells.alignment.feedback).toBe('match');
    expect(result.cells.biome.feedback).toBe('match');
    expect(result.cells.movement.feedback).toBe('match');
    expect(result.cells.senses.feedback).toBe('match');
  });

  describe('size comparison', () => {
    it('returns higher when answer is larger', () => {
      const guess = makeMonster({ size: 'Small' });
      const answer = makeMonster({ size: 'Large' });
      const result = compareMonsters(guess, answer);
      expect(result.cells.size.feedback).toBe('higher');
    });

    it('returns lower when answer is smaller', () => {
      const guess = makeMonster({ size: 'Huge' });
      const answer = makeMonster({ size: 'Medium' });
      const result = compareMonsters(guess, answer);
      expect(result.cells.size.feedback).toBe('lower');
    });
  });

  describe('CR comparison', () => {
    it('returns higher when answer CR is higher', () => {
      const guess = makeMonster({ cr: 3 });
      const answer = makeMonster({ cr: 10 });
      const result = compareMonsters(guess, answer);
      expect(result.cells.cr.feedback).toBe('higher');
    });

    it('returns lower when answer CR is lower', () => {
      const guess = makeMonster({ cr: 10 });
      const answer = makeMonster({ cr: 3 });
      const result = compareMonsters(guess, answer);
      expect(result.cells.cr.feedback).toBe('lower');
    });

    it('handles fractional CRs', () => {
      const guess = makeMonster({ cr: 0.125 });
      const answer = makeMonster({ cr: 0.125 });
      const result = compareMonsters(guess, answer);
      expect(result.cells.cr.feedback).toBe('match');
      expect(result.cells.cr.value).toBe('1/8');
    });
  });

  describe('alignment comparison', () => {
    it('returns match for exact alignment', () => {
      const guess = makeMonster({ alignment: { law: 'L', moral: 'E' } });
      const answer = makeMonster({ alignment: { law: 'L', moral: 'E' } });
      const result = compareMonsters(guess, answer);
      expect(result.cells.alignment.feedback).toBe('match');
    });

    it('returns partial for one axis match', () => {
      const guess = makeMonster({ alignment: { law: 'L', moral: 'G' } });
      const answer = makeMonster({ alignment: { law: 'L', moral: 'E' } });
      const result = compareMonsters(guess, answer);
      expect(result.cells.alignment.feedback).toBe('partial');
    });

    it('returns wrong for no axis match', () => {
      const guess = makeMonster({ alignment: { law: 'L', moral: 'G' } });
      const answer = makeMonster({ alignment: { law: 'C', moral: 'E' } });
      const result = compareMonsters(guess, answer);
      expect(result.cells.alignment.feedback).toBe('wrong');
    });

    it('handles unaligned', () => {
      const guess = makeMonster({ alignment: 'unaligned' });
      const answer = makeMonster({ alignment: 'unaligned' });
      const result = compareMonsters(guess, answer);
      expect(result.cells.alignment.feedback).toBe('match');
    });

    it('unaligned vs aligned is wrong', () => {
      const guess = makeMonster({ alignment: 'unaligned' });
      const answer = makeMonster({ alignment: { law: 'L', moral: 'E' } });
      const result = compareMonsters(guess, answer);
      expect(result.cells.alignment.feedback).toBe('wrong');
    });
  });

  describe('set comparisons (biome, movement, senses)', () => {
    it('returns match for identical sets', () => {
      const guess = makeMonster({ biomes: ['forest', 'mountain'] });
      const answer = makeMonster({ biomes: ['forest', 'mountain'] });
      const result = compareMonsters(guess, answer);
      expect(result.cells.biome.feedback).toBe('match');
    });

    it('returns partial for overlapping sets', () => {
      const guess = makeMonster({ biomes: ['forest', 'coast'] });
      const answer = makeMonster({ biomes: ['forest', 'mountain'] });
      const result = compareMonsters(guess, answer);
      expect(result.cells.biome.feedback).toBe('partial');
    });

    it('returns wrong for disjoint sets', () => {
      const guess = makeMonster({ biomes: ['coast'] });
      const answer = makeMonster({ biomes: ['underdark'] });
      const result = compareMonsters(guess, answer);
      expect(result.cells.biome.feedback).toBe('wrong');
    });

    it('returns match when both empty', () => {
      const guess = makeMonster({ biomes: [] });
      const answer = makeMonster({ biomes: [] });
      const result = compareMonsters(guess, answer);
      expect(result.cells.biome.feedback).toBe('match');
    });

    it('returns wrong when one is empty', () => {
      const guess = makeMonster({ biomes: ['forest'] });
      const answer = makeMonster({ biomes: [] });
      const result = compareMonsters(guess, answer);
      expect(result.cells.biome.feedback).toBe('wrong');
    });
  });
});

describe('formatCR', () => {
  it('formats fractional CRs', () => {
    expect(formatCR(0.125)).toBe('1/8');
    expect(formatCR(0.25)).toBe('1/4');
    expect(formatCR(0.5)).toBe('1/2');
  });

  it('formats integer CRs', () => {
    expect(formatCR(1)).toBe('1');
    expect(formatCR(30)).toBe('30');
  });
});

describe('formatAlignment', () => {
  it('formats alignment object', () => {
    expect(formatAlignment({ law: 'L', moral: 'E' })).toBe('LE');
    expect(formatAlignment({ law: 'C', moral: 'G' })).toBe('CG');
    expect(formatAlignment({ law: 'N', moral: 'N' })).toBe('NN');
  });

  it('formats unaligned', () => {
    expect(formatAlignment('unaligned')).toBe('Unaligned');
  });
});

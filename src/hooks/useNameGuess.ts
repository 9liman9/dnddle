import { useState, useCallback, useRef } from 'react';
import type { Monster, NameGuess } from '../types';

const GAME_KEY_PREFIX = 'dnddle-game-';

interface SavedNameGame {
  date: string;
  guessNames: string[];
  solved: boolean;
  gaveUp: boolean;
}

function loadSaved(mode: string, dateStr: string): SavedNameGame | null {
  try {
    const stored = localStorage.getItem(GAME_KEY_PREFIX + mode);
    if (!stored) return null;
    const saved: SavedNameGame = JSON.parse(stored);
    if (saved.date !== dateStr) return null;
    return saved;
  } catch { return null; }
}

function saveGame(mode: string, state: SavedNameGame) {
  localStorage.setItem(GAME_KEY_PREFIX + mode, JSON.stringify(state));
}

export function useNameGuess(
  mode: string,
  targetMonster: Monster | null,
  monsters: Monster[],
  dateString: string,
  isRandom: boolean,
) {
  const [guesses, setGuesses] = useState<NameGuess[]>([]);
  const [solved, setSolved] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [guessedIds, setGuessedIds] = useState<Set<number>>(new Set());
  const restoredRef = useRef(false);

  // Restore saved daily game (only once, only for daily mode)
  if (targetMonster && monsters.length > 0 && !isRandom && !restoredRef.current) {
    restoredRef.current = true;
    const saved = loadSaved(mode, dateString);
    if (saved && saved.guessNames.length > 0) {
      const restoredGuesses: NameGuess[] = [];
      const restoredIds = new Set<number>();

      for (const name of saved.guessNames) {
        const monster = monsters.find(m => m.name === name);
        if (monster) {
          const correct = monster.name.toLowerCase() === targetMonster.name.toLowerCase();
          restoredGuesses.push({ name: monster.name, correct, tokenUrl: monster.tokenUrl });
          restoredIds.add(monster.id);
        }
      }

      if (restoredGuesses.length > 0) {
        setGuesses(restoredGuesses);
        setGuessedIds(restoredIds);
        setSolved(saved.solved);
        setGaveUp(saved.gaveUp);
      }
    }
  }

  const submitGuess = useCallback((guessMonster: Monster) => {
    if (!targetMonster || solved || gaveUp) return;

    const correct = guessMonster.name.toLowerCase() === targetMonster.name.toLowerCase();
    const guess: NameGuess = { name: guessMonster.name, correct, tokenUrl: guessMonster.tokenUrl };

    setGuesses(prev => {
      const updated = [...prev, guess];
      if (!isRandom) {
        saveGame(mode, {
          date: dateString,
          guessNames: updated.map(g => g.name),
          solved: correct,
          gaveUp: false,
        });
      }
      return updated;
    });

    setGuessedIds(prev => new Set([...prev, guessMonster.id]));

    if (correct) setSolved(true);
  }, [targetMonster, solved, gaveUp, mode, dateString, isRandom]);

  const giveUp = useCallback(() => {
    if (solved || gaveUp) return;
    setGaveUp(true);
    if (!isRandom) {
      saveGame(mode, {
        date: dateString,
        guessNames: guesses.map(g => g.name),
        solved: false,
        gaveUp: true,
      });
    }
  }, [solved, gaveUp, mode, dateString, guesses, isRandom]);

  const reset = useCallback(() => {
    setGuesses([]);
    setSolved(false);
    setGaveUp(false);
    setGuessedIds(new Set());
    restoredRef.current = true;
  }, []);

  return {
    guesses,
    solved,
    gaveUp,
    guessedIds,
    submitGuess,
    giveUp,
    reset,
    gameOver: solved || gaveUp,
  };
}

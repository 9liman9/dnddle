import { useState, useCallback, useRef } from 'react';
import type { Monster, GuessFeedback } from '../types';
import { compareMonsters } from '../lib/compare';

const GAME_STATE_KEY = 'monsterdle-game';

interface SavedGameState {
  date: string;
  guessIds: number[];
  solved: boolean;
  gaveUp: boolean;
  startTime: number;
}

function loadSavedGame(dateStr: string): SavedGameState | null {
  try {
    const stored = localStorage.getItem(GAME_STATE_KEY);
    if (!stored) return null;
    const saved: SavedGameState = JSON.parse(stored);
    if (saved.date !== dateStr) return null;
    return saved;
  } catch {
    return null;
  }
}

function saveGameState(state: SavedGameState) {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function useGame(
  dailyMonster: Monster | null,
  monsters: Monster[],
  _dailyNumber: number,
  dateString: string,
  onWin: (guessCount: number, dateStr: string) => void,
  isRandom: boolean,
) {
  const [guesses, setGuesses] = useState<GuessFeedback[]>([]);
  const [solved, setSolved] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [startTime] = useState(Date.now());
  const [guessedIds, setGuessedIds] = useState<Set<number>>(new Set());
  const restoredRef = useRef(false);

  // Restore saved daily game (only once, only for daily mode)
  if (dailyMonster && monsters.length > 0 && !isRandom && !restoredRef.current) {
    restoredRef.current = true;
    const saved = loadSavedGame(dateString);
    if (saved && saved.guessIds.length > 0) {
      const restoredGuesses: GuessFeedback[] = [];
      const restoredIds = new Set<number>();

      for (const id of saved.guessIds) {
        const monster = monsters.find(m => m.id === id);
        if (monster) {
          restoredGuesses.push(compareMonsters(monster, dailyMonster));
          restoredIds.add(id);
        }
      }

      // Only restore if we actually found matching monsters
      // (data may have changed since last save)
      if (restoredGuesses.length > 0) {
        setGuesses(restoredGuesses);
        setGuessedIds(restoredIds);
        setSolved(saved.solved);
        setGaveUp(saved.gaveUp);
      }
    }
  }

  const submitGuess = useCallback(
    (guessMonster: Monster) => {
      if (!dailyMonster || solved || gaveUp) return;

      const feedback = compareMonsters(guessMonster, dailyMonster);
      const isCorrect = Object.values(feedback.cells).every(
        c => c.feedback === 'match'
      );

      setGuesses(prev => {
        const updated = [...prev, feedback];

        // Only save daily games to localStorage
        if (!isRandom) {
          saveGameState({
            date: dateString,
            guessIds: updated.map(g => g.monster.id),
            solved: isCorrect,
            gaveUp: false,
            startTime,
          });
        }

        return updated;
      });

      setGuessedIds(prev => new Set([...prev, guessMonster.id]));

      if (isCorrect) {
        setSolved(true);
        if (!isRandom) {
          onWin(guesses.length + 1, dateString);
        }
      }
    },
    [dailyMonster, solved, gaveUp, guesses.length, dateString, startTime, onWin, isRandom]
  );

  const giveUp = useCallback(() => {
    if (solved || gaveUp) return;
    setGaveUp(true);
    if (!isRandom) {
      saveGameState({
        date: dateString,
        guessIds: guesses.map(g => g.monster.id),
        solved: false,
        gaveUp: true,
        startTime,
      });
    }
  }, [solved, gaveUp, dateString, guesses, startTime, isRandom]);

  const reset = useCallback(() => {
    setGuesses([]);
    setSolved(false);
    setGaveUp(false);
    setGuessedIds(new Set());
    restoredRef.current = true; // prevent re-restore after reset
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

import { useState, useCallback } from 'react';
import type { PlayerStats } from '../types';

const STATS_KEY = 'monsterdle-stats';

function getDefaultStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastPlayedDate: '',
  };
}

function loadStats(): PlayerStats {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return getDefaultStats();
}

function saveStats(stats: PlayerStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useLocalStats() {
  const [stats, setStats] = useState<PlayerStats>(loadStats);

  const recordWin = useCallback((guessCount: number, dateStr: string) => {
    setStats(prev => {
      const isConsecutive = isNextDay(prev.lastPlayedDate, dateStr);
      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;

      const updated: PlayerStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + 1,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        guessDistribution: {
          ...prev.guessDistribution,
          [guessCount]: (prev.guessDistribution[guessCount] || 0) + 1,
        },
        lastPlayedDate: dateStr,
      };

      saveStats(updated);
      return updated;
    });
  }, []);

  const recordLoss = useCallback((dateStr: string) => {
    setStats(prev => {
      const updated: PlayerStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: 0,
        lastPlayedDate: dateStr,
      };

      saveStats(updated);
      return updated;
    });
  }, []);

  return { stats, recordWin, recordLoss };
}

function isNextDay(prev: string, current: string): boolean {
  if (!prev) return false;
  const prevDate = new Date(prev);
  const currDate = new Date(current);
  const diff = currDate.getTime() - prevDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return diff > 0 && diff <= dayMs;
}

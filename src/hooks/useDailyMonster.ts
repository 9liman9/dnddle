import { useState, useEffect, useCallback } from 'react';
import type { Monster, GameMode } from '../types';
import { loadMonsters } from '../lib/monsters';
import { getDailyMonsterIndex, getDailyNumber, getDateString } from '../lib/daily';

interface DailyMonsterState {
  monsters: Monster[];
  dailyMonster: Monster | null;
  dailyNumber: number;
  dateString: string;
  loading: boolean;
  error: string | null;
  isRandom: boolean;
}

export function useDailyMonster(mode: GameMode) {
  const [state, setState] = useState<DailyMonsterState>({
    monsters: [],
    dailyMonster: null,
    dailyNumber: 0,
    dateString: '',
    loading: true,
    error: null,
    isRandom: false,
  });

  useEffect(() => {
    loadMonsters()
      .then(monsters => {
        const today = new Date();

        let pool = monsters;

        const index = getDailyMonsterIndex(pool.length, today, mode);
        const dailyMonster = pool[index];
        const dailyNumber = getDailyNumber(today);
        const dateString = getDateString(today);

        setState({
          monsters,
          dailyMonster,
          dailyNumber,
          dateString,
          loading: false,
          error: null,
          isRandom: false,
        });
      })
      .catch(err => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: `Failed to load monster data: ${err.message}`,
        }));
      });
  }, [mode]);

  const pickRandom = useCallback(() => {
    if (state.monsters.length === 0) return;

    let pool = state.monsters;

    const idx = Math.floor(Math.random() * pool.length);
    setState(prev => ({
      ...prev,
      dailyMonster: pool[idx],
      dailyNumber: 0,
      isRandom: true,
    }));
  }, [state.monsters, mode]);

  const backToDaily = useCallback(() => {
    if (state.monsters.length === 0) return;
    const today = new Date();
    const index = getDailyMonsterIndex(state.monsters.length, today, mode);
    setState(prev => ({
      ...prev,
      dailyMonster: prev.monsters[index],
      dailyNumber: getDailyNumber(today),
      dateString: getDateString(today),
      isRandom: false,
    }));
  }, [state.monsters, mode]);

  return { ...state, pickRandom, backToDaily };
}

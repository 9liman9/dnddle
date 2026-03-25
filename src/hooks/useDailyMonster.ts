import { useState, useEffect, useCallback } from 'react';
import type { Monster } from '../types';
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

export function useDailyMonster() {
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
        const index = getDailyMonsterIndex(monsters.length, today);
        const dailyMonster = monsters[index];
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
  }, []);

  const pickRandom = useCallback(() => {
    if (state.monsters.length === 0) return;
    const idx = Math.floor(Math.random() * state.monsters.length);
    setState(prev => ({
      ...prev,
      dailyMonster: prev.monsters[idx],
      dailyNumber: 0,
      isRandom: true,
    }));
  }, [state.monsters]);

  const backToDaily = useCallback(() => {
    if (state.monsters.length === 0) return;
    const today = new Date();
    const index = getDailyMonsterIndex(state.monsters.length, today);
    setState(prev => ({
      ...prev,
      dailyMonster: prev.monsters[index],
      dailyNumber: getDailyNumber(today),
      dateString: getDateString(today),
      isRandom: false,
    }));
  }, [state.monsters]);

  return { ...state, pickRandom, backToDaily };
}

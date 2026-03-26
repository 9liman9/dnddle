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

        // For artwork/emoji, pick from monsters with lore so hint always works
        let pool = monsters;
        if (mode === 'artwork') {
          const lorePool = monsters.filter(m => m.lore && m.lore.length > 50);
          if (lorePool.length > 100) pool = lorePool;
        }

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

  const pickRandom = useCallback((pool?: Monster[]) => {
    const candidates = pool && pool.length > 0 ? pool : state.monsters;
    if (candidates.length === 0) return;

    const idx = Math.floor(Math.random() * candidates.length);
    setState(prev => ({
      ...prev,
      dailyMonster: candidates[idx],
      dailyNumber: 0,
      isRandom: true,
    }));
  }, [state.monsters]);

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

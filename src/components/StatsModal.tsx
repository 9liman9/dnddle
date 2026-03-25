import { useMemo } from 'react';
import type { Monster, PlayerStats } from '../types';
import './StatsModal.css';

interface StatsModalProps {
  stats: PlayerStats;
  monsters: Monster[];
  onClose: () => void;
}

// Group sources into categories
const SOURCE_CATEGORIES: Record<string, string[]> = {
  'Core Rulebooks': ['MM', 'PHB', 'DMG', 'XMM', 'XPHB', 'XDMG'],
  'Monster Supplements': ['VGM', 'MTF', 'MPMM', 'FTD', 'BGG', 'BAM', 'MFF', 'MCV1SC', 'MCV2DC', 'MCV3MC', 'MCV4EC'],
  'Adventure Modules': [
    'CoS', 'ToA', 'SKT', 'OotA', 'PotA', 'HotDQ', 'RoT', 'GoS', 'BGDIA',
    'WDH', 'WDMM', 'TftYP', 'LMoP', 'PaBTSO', 'IDRotF', 'WBtW', 'CM',
    'DSotDQ', 'VEOR', 'BMT', 'CoA', 'ToFW',
  ],
  'Settings & Expansions': ['GGR', 'EGW', 'ERLW', 'MOT', 'VRGR', 'SCC', 'TCE', 'XGE'],
};

function categorizeSource(source: string): string {
  for (const [category, sources] of Object.entries(SOURCE_CATEGORIES)) {
    if (sources.includes(source)) return category;
  }
  return 'Other';
}

export function StatsModal({ stats, monsters, onClose }: StatsModalProps) {
  const maxGuesses = Math.max(...Object.values(stats.guessDistribution), 1);

  const monsterStats = useMemo(() => {
    const byCategory = new Map<string, number>();
    const byType = new Map<string, number>();

    for (const m of monsters) {
      const cat = categorizeSource(m.source);
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
      byType.set(m.type, (byType.get(m.type) || 0) + 1);
    }

    return {
      total: monsters.length,
      categories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      types: [...byType.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [monsters]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={e => e.stopPropagation()}>
        <button className="stats-modal__close" onClick={onClose}>✕</button>

        <h2 className="stats-modal__title">Your Statistics</h2>

        <div className="stats-modal__numbers">
          <div className="stats-modal__stat">
            <span className="stats-modal__value">{stats.gamesPlayed}</span>
            <span className="stats-modal__label">Played</span>
          </div>
          <div className="stats-modal__stat">
            <span className="stats-modal__value">
              {stats.gamesPlayed > 0
                ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
                : 0}%
            </span>
            <span className="stats-modal__label">Win %</span>
          </div>
          <div className="stats-modal__stat">
            <span className="stats-modal__value">{stats.currentStreak}</span>
            <span className="stats-modal__label">Streak</span>
          </div>
          <div className="stats-modal__stat">
            <span className="stats-modal__value">{stats.maxStreak}</span>
            <span className="stats-modal__label">Max Streak</span>
          </div>
        </div>

        {Object.keys(stats.guessDistribution).length > 0 && (
          <>
            <h3 className="stats-modal__dist-title">Guess Distribution</h3>
            <div className="stats-modal__distribution">
              {Object.entries(stats.guessDistribution)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([guessNum, count]) => (
                  <div key={guessNum} className="stats-modal__bar-row">
                    <span className="stats-modal__bar-label">{guessNum}</span>
                    <div className="stats-modal__bar-track">
                      <div
                        className="stats-modal__bar-fill"
                        style={{ width: `${Math.max((count / maxGuesses) * 100, 8)}%` }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* Bestiary stats */}
        <div className="stats-modal__divider" />
        <h2 className="stats-modal__title">Bestiary</h2>

        <div className="stats-modal__numbers">
          <div className="stats-modal__stat">
            <span className="stats-modal__value">{monsterStats.total.toLocaleString()}</span>
            <span className="stats-modal__label">Total Monsters</span>
          </div>
        </div>

        <h3 className="stats-modal__dist-title">By Source Category</h3>
        <div className="stats-modal__distribution">
          {monsterStats.categories.map(([cat, count]) => (
            <div key={cat} className="stats-modal__bar-row">
              <span className="stats-modal__bar-label stats-modal__bar-label--wide">{cat}</span>
              <div className="stats-modal__bar-track">
                <div
                  className="stats-modal__bar-fill stats-modal__bar-fill--gold"
                  style={{ width: `${Math.max((count / monsterStats.total) * 100, 5)}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="stats-modal__dist-title">By Creature Type</h3>
        <div className="stats-modal__distribution">
          {monsterStats.types.map(([type, count]) => (
            <div key={type} className="stats-modal__bar-row">
              <span className="stats-modal__bar-label stats-modal__bar-label--wide">{type}</span>
              <div className="stats-modal__bar-track">
                <div
                  className="stats-modal__bar-fill stats-modal__bar-fill--gold"
                  style={{ width: `${Math.max((count / monsterStats.types[0][1]) * 100, 5)}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { GameMode } from '../types';
import { Countdown } from './Countdown';
import './Header.css';

interface HeaderProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  streak: number;
  totalWins: number;
  onStatsClick: () => void;
  onHelpClick: () => void;
  onTutorialClick: () => void;
}

const MODES: { id: GameMode; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'artwork', label: 'Artwork' },
  { id: 'spelldle', label: "Spell'dle" },
  { id: 'emoji', label: 'Emoji' },
];

export function Header({ mode, onModeChange, streak, totalWins, onStatsClick, onHelpClick, onTutorialClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__top-row">
        <h1 className="header__title">
          <img src="/dnd-logo.svg" alt="D&D" className="header__logo" />
          <span className="header__dle">'dle</span>
        </h1>
        <Countdown />
      </div>

      <p className="header__subtitle">Guess the creature of the realm</p>

      <nav className="header__modes">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`mode-tab ${mode === m.id ? 'mode-tab--active' : ''}`}
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <div className="header__stats">
        {streak > 0 && <span className="stat-badge">🔥 {streak}</span>}
        {totalWins > 0 && <span className="stat-badge">🏆 {totalWins}</span>}
        <button className="stat-btn" onClick={onStatsClick}>📊 Stats</button>
        <button className="stat-btn" onClick={onTutorialClick}>🎬 Guide</button>
        <button className="stat-btn" onClick={onHelpClick}>❓ Rules</button>
      </div>
    </header>
  );
}

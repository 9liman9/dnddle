import './Header.css';

interface HeaderProps {
  streak: number;
  totalWins: number;
  onStatsClick: () => void;
  onHelpClick: () => void;
}

export function Header({ streak, totalWins, onStatsClick, onHelpClick }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header__title">
        <img src="/dnd-logo.svg" alt="D&D" className="header__logo" />
        <span className="header__dle">'dle</span>
      </h1>
      <p className="header__subtitle">Guess the creature of the realm</p>

      <nav className="header__modes">
        <button className="mode-tab mode-tab--active">Classic</button>
        <button className="mode-tab mode-tab--disabled" disabled>Artwork</button>
        <button className="mode-tab mode-tab--disabled" disabled>Stat Block</button>
        <button className="mode-tab mode-tab--disabled" disabled>Lore</button>
      </nav>

      <div className="header__stats">
        {streak > 0 && <span className="stat-badge">🔥 {streak}</span>}
        {totalWins > 0 && <span className="stat-badge">🏆 {totalWins}</span>}
        <button className="stat-btn" onClick={onStatsClick}>📊 Stats</button>
        <button className="stat-btn" onClick={onHelpClick}>❓ Rules</button>
      </div>
    </header>
  );
}

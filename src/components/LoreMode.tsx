import type { Monster, NameGuess } from '../types';
import { SearchBar } from './SearchBar';
import { NameGuessList } from './NameGuessList';
import './LoreMode.css';

interface LoreModeProps {
  monster: Monster;
  monsters: Monster[];
  guesses: NameGuess[];
  guessedIds: Set<number>;
  solved: boolean;
  gameOver: boolean;
  onGuess: (monster: Monster) => void;
}

function redactName(text: string, name: string): string {
  return text.replace(
    new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    '█████'
  );
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

export function LoreMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: LoreModeProps) {
  const showName = solved || gameOver;
  const loreText = monster.lore || 'No lore available for this creature.';
  const displayText = showName ? loreText : redactName(loreText, monster.name);

  // Progressive extra hints
  const showType = guesses.length >= 2 || showName;
  const showCR = guesses.length >= 4 || showName;
  const showSource = guesses.length >= 6 || showName;

  return (
    <div className="lore-mode">
      <div className="lore-mode__card">
        <div className="lore-mode__scroll-header">
          <span className="lore-mode__scroll-title">
            {showName ? monster.name : 'Ancient Scroll'}
          </span>
        </div>

        <div className="lore-mode__text">
          <p>{displayText}</p>
        </div>

        {/* Progressive clues */}
        <div className="lore-mode__clues">
          {showType && (
            <div className="lore-mode__clue">
              <span className="lore-mode__clue-label">Type</span>
              <span className="lore-mode__clue-value">{monster.size} {monster.type}</span>
            </div>
          )}
          {showCR && (
            <div className="lore-mode__clue">
              <span className="lore-mode__clue-label">CR</span>
              <span className="lore-mode__clue-value">{formatCR(monster.cr)}</span>
            </div>
          )}
          {showSource && (
            <div className="lore-mode__clue">
              <span className="lore-mode__clue-label">Source</span>
              <span className="lore-mode__clue-value">{monster.sourceFull}</span>
            </div>
          )}
          {!showType && (
            <div className="lore-mode__clue lore-mode__clue--locked">
              <span className="lore-mode__clue-label">More clues unlock with each guess</span>
            </div>
          )}
        </div>

        {showName && monster.artworkUrl && (
          <div className="lore-mode__reveal-art">
            <img
              src={monster.artworkUrl}
              alt={monster.name}
              className="lore-mode__reveal-img"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      <SearchBar
        monsters={monsters}
        guessedIds={guessedIds}
        onGuess={onGuess}
        disabled={gameOver}
      />

      <NameGuessList guesses={guesses} />
    </div>
  );
}

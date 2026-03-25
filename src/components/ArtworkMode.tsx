import { useState } from 'react';
import type { Monster, NameGuess } from '../types';
import { SearchBar } from './SearchBar';
import { NameGuessList } from './NameGuessList';
import './ArtworkMode.css';

interface ArtworkModeProps {
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

export function ArtworkMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: ArtworkModeProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = monster.artworkUrl || monster.tokenUrl;
  const showName = solved || gameOver;

  // Blur decreases with each guess: starts at 20px, -3px per guess, min 0
  const blur = showName ? 0 : Math.max(20 - guesses.length * 3, 0);
  const brightness = showName ? 1 : Math.min(0.4 + guesses.length * 0.08, 1);

  // Lore hints
  const showLore = guesses.length >= 2 && monster.lore;
  const showTraits = guesses.length >= 4 && monster.traits && monster.traits.length > 0;
  const showSource = guesses.length >= 6;

  return (
    <div className="artwork-mode">
      <div className="artwork-mode__card">
        <h2 className="artwork-mode__title">
          {showName ? monster.name : 'Who is this creature?'}
        </h2>
        <p className="artwork-mode__subtitle">
          {showName
            ? `${monster.size} ${monster.type} — CR ${formatCR(monster.cr)}`
            : 'Identify the monster from its artwork'}
        </p>

        {imageUrl && !imgError ? (
          <div className="artwork-mode__frame">
            <img
              src={imageUrl}
              alt={showName ? monster.name : 'Mystery creature'}
              className="artwork-mode__img"
              style={{
                filter: `blur(${blur}px) brightness(${brightness})`,
              }}
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="artwork-mode__no-art">
            <p>No artwork available for today's creature.</p>
            <p className="artwork-mode__fallback-hint">
              It's a {monster.size} {monster.type} from {monster.sourceFull}
            </p>
          </div>
        )}

        {!showName && guesses.length > 0 && (
          <p className="artwork-mode__hint-text">
            Blur: {blur > 0 ? `${blur}px remaining` : 'Clear!'}
            {guesses.length >= 3 && ` — It's a ${monster.type}`}
            {guesses.length >= 5 && ` from ${monster.sourceFull}`}
          </p>
        )}
      </div>

      {/* Lore hint cards */}
      {(showLore || showTraits || showSource) && !showName && (
        <div className="hint-cards">
          {showLore && (
            <div className="hint-cards__card">
              <span className="hint-cards__label">📜 Ancient Lore</span>
              <p className="hint-cards__text">{redactName(monster.lore!, monster.name)}</p>
            </div>
          )}
          {showTraits && (
            <div className="hint-cards__card">
              <span className="hint-cards__label">⚡ Known Traits</span>
              <p className="hint-cards__text">{monster.traits!.join(', ')}</p>
            </div>
          )}
          {showSource && (
            <div className="hint-cards__card">
              <span className="hint-cards__label">📖 Origin</span>
              <p className="hint-cards__text">{monster.sourceFull}</p>
            </div>
          )}
        </div>
      )}

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

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

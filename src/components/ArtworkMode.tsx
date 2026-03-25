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

export function ArtworkMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: ArtworkModeProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = monster.artworkUrl || monster.tokenUrl;

  // Blur decreases with each guess: starts at 20px, -3px per guess, min 0
  const blur = solved ? 0 : Math.max(20 - guesses.length * 3, 0);
  // Brightness also increases
  const brightness = solved ? 1 : Math.min(0.4 + guesses.length * 0.08, 1);

  return (
    <div className="artwork-mode">
      <div className="artwork-mode__card">
        <h2 className="artwork-mode__title">
          {solved ? monster.name : 'Who is this creature?'}
        </h2>
        <p className="artwork-mode__subtitle">
          {solved
            ? `${monster.size} ${monster.type} — CR ${formatCR(monster.cr)}`
            : 'Identify the monster from its artwork'}
        </p>

        {imageUrl && !imgError ? (
          <div className="artwork-mode__frame">
            <img
              src={imageUrl}
              alt={solved ? monster.name : 'Mystery creature'}
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

        {!solved && !gameOver && guesses.length > 0 && (
          <p className="artwork-mode__hint-text">
            Blur: {blur > 0 ? `${blur}px remaining` : 'Clear!'}
            {guesses.length >= 3 && ` — It's a ${monster.type}`}
            {guesses.length >= 5 && ` from ${monster.sourceFull}`}
          </p>
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

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

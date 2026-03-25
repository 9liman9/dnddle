import { useState } from 'react';
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
  // Redact full name and each individual word (for "Fire Giant" -> also redacts "fire" and "giant")
  const patterns = [name, ...name.split(/\s+/).filter(w => w.length > 2)];
  let result = text;
  for (const pattern of patterns) {
    result = result.replace(
      new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      '\u2588\u2588\u2588\u2588\u2588'
    );
  }
  return result;
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

function formatAlignment(alignment: Monster['alignment']): string {
  if (alignment === 'unaligned') return 'unaligned';
  const law = alignment.law === 'L' ? 'lawful' : alignment.law === 'C' ? 'chaotic' : 'neutral';
  const moral = alignment.moral === 'G' ? 'good' : alignment.moral === 'E' ? 'evil' : 'neutral';
  return `${law} ${moral}`;
}

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

export function LoreMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: LoreModeProps) {
  const [imgError, setImgError] = useState(false);
  const showName = solved || gameOver;
  const g = guesses.length;
  const imageUrl = monster.artworkUrl || monster.tokenUrl;
  const hasArt = imageUrl && !imgError;

  // Handle missing lore gracefully
  const loreText = monster.lore || 'The ancient scrolls hold no tales of this creature. Use the clues below to identify it.';
  const displayText = showName ? (monster.lore || loreText) : redactName(loreText, monster.name);

  // Progressive clues
  const showType = g >= 2 || showName;
  const showCR = g >= 4 || showName;
  const showSource = g >= 6 || showName;

  // Progressive artwork hint (blurred -> clear)
  const showArtHint = g >= 3 && hasArt && !showName;
  const artBlur = showName ? 0 : Math.max(20 - (g - 3) * 5, 0); // starts at 20px at 3 guesses, clear by 7

  return (
    <div className="lore-mode">
      {/* Reveal splash on solve/give-up */}
      {showName && (
        <div className="lore-mode__reveal-splash">
          {hasArt && (
            <div className="lore-mode__reveal-art-frame">
              <img
                src={imageUrl}
                alt={monster.name}
                className="lore-mode__reveal-splash-img"
                onError={() => setImgError(true)}
              />
            </div>
          )}
          <h2 className="lore-mode__reveal-name">{monster.name}</h2>
          <p className="lore-mode__reveal-meta">
            {monster.size} {monster.type}, {formatAlignment(monster.alignment)} — CR {formatCR(monster.cr)}
          </p>

          {/* Mini stat card */}
          <div className="lore-mode__reveal-stats">
            {monster.ac !== undefined && (
              <div className="lore-mode__reveal-stat">
                <span className="lore-mode__reveal-stat-label">AC</span>
                <span className="lore-mode__reveal-stat-value">{monster.ac}</span>
              </div>
            )}
            {monster.hp !== undefined && (
              <div className="lore-mode__reveal-stat">
                <span className="lore-mode__reveal-stat-label">HP</span>
                <span className="lore-mode__reveal-stat-value">{monster.hp}</span>
              </div>
            )}
            {[
              { label: 'STR', val: monster.str },
              { label: 'DEX', val: monster.dex },
              { label: 'CON', val: monster.con },
              { label: 'INT', val: monster.int },
              { label: 'WIS', val: monster.wis },
              { label: 'CHA', val: monster.cha },
            ].map(({ label, val }) => val !== undefined ? (
              <div key={label} className="lore-mode__reveal-stat">
                <span className="lore-mode__reveal-stat-label">{label}</span>
                <span className="lore-mode__reveal-stat-value">{val} ({mod(val)})</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Lore scroll card */}
      <div className="lore-mode__card">
        <div className="lore-mode__scroll-header">
          <span className="lore-mode__scroll-title">
            {showName ? monster.name : 'Ancient Scroll'}
          </span>
        </div>

        <div className="lore-mode__text">
          <p>{displayText}</p>
        </div>

        {/* Progressive artwork hint — blurred image as a clue */}
        {showArtHint && (
          <div className="lore-mode__art-hint">
            <p className="lore-mode__art-hint-label">A vision from the archives...</p>
            <div className="lore-mode__art-hint-frame">
              <img
                src={imageUrl}
                alt="Blurred hint"
                className="lore-mode__art-hint-img"
                style={{ filter: `blur(${artBlur}px)` }}
                onError={() => setImgError(true)}
              />
            </div>
          </div>
        )}

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

        {/* Full lore on reveal (in case the scroll was showing the fallback text) */}
        {showName && monster.lore && (
          <div className="lore-mode__full-lore">
            <div className="lore-mode__full-lore-header">Full Lore</div>
            <p className="lore-mode__full-lore-text">{monster.lore}</p>
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

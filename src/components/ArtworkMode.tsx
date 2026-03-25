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

export function ArtworkMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: ArtworkModeProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = monster.artworkUrl || monster.tokenUrl;
  const showName = solved || gameOver;
  const g = guesses.length;
  const hasArt = imageUrl && !imgError;

  // Blur: start at 25px, decrease by 2.5px per guess, clear at ~10 guesses
  const blur = showName ? 0 : Math.max(25 - g * 2.5, 0);

  // Progressive hints (delayed compared to old version)
  const showLore = g >= 4 && monster.lore;
  const showTraits = g >= 6 && monster.traits && monster.traits.length > 0;
  const showSource = g >= 8;

  // No-art fallback: progressive stat reveals instead
  const noArtShowType = g >= 1 || showName;
  const noArtShowCR = g >= 2 || showName;
  const noArtShowAbilities = g >= 3 || showName;
  const noArtShowMovement = g >= 4 || showName;
  const noArtShowSenses = g >= 5 || showName;

  return (
    <div className="artwork-mode">
      {/* Reveal splash on solve */}
      {showName && (
        <div className="artwork-mode__reveal">
          {hasArt && (
            <div className="artwork-mode__reveal-art">
              <img
                src={imageUrl}
                alt={monster.name}
                className="artwork-mode__reveal-img"
              />
            </div>
          )}
          <h2 className="artwork-mode__reveal-name">{monster.name}</h2>
          <p className="artwork-mode__reveal-meta">
            {monster.size} {monster.type}, {formatAlignment(monster.alignment)} — CR {formatCR(monster.cr)}
          </p>

          {/* Mini stat card on reveal */}
          <div className="artwork-mode__reveal-stats">
            {monster.ac !== undefined && (
              <div className="artwork-mode__reveal-stat">
                <span className="artwork-mode__reveal-stat-label">AC</span>
                <span className="artwork-mode__reveal-stat-value">{monster.ac}</span>
              </div>
            )}
            {monster.hp !== undefined && (
              <div className="artwork-mode__reveal-stat">
                <span className="artwork-mode__reveal-stat-label">HP</span>
                <span className="artwork-mode__reveal-stat-value">{monster.hp}</span>
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
              <div key={label} className="artwork-mode__reveal-stat">
                <span className="artwork-mode__reveal-stat-label">{label}</span>
                <span className="artwork-mode__reveal-stat-value">{val} ({mod(val)})</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Main card — artwork or fallback */}
      {!showName && (
        <div className="artwork-mode__card">
          <h2 className="artwork-mode__title">Who is this creature?</h2>
          <p className="artwork-mode__subtitle">Identify the monster from its artwork</p>

          {hasArt ? (
            <div className="artwork-mode__frame">
              <img
                src={imageUrl}
                alt="Mystery creature"
                className="artwork-mode__img"
                style={{ filter: `blur(${blur}px)` }}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="artwork-mode__no-art">
              <p className="artwork-mode__no-art-title">This creature has no artwork.</p>
              <p className="artwork-mode__no-art-sub">Here are some clues instead:</p>

              <div className="artwork-mode__fallback-clues">
                {noArtShowType && (
                  <div className="artwork-mode__fallback-clue">
                    <span className="artwork-mode__fallback-label">Type</span>
                    <span className="artwork-mode__fallback-value">{monster.type}</span>
                  </div>
                )}
                {noArtShowCR && (
                  <div className="artwork-mode__fallback-clue">
                    <span className="artwork-mode__fallback-label">CR</span>
                    <span className="artwork-mode__fallback-value">{formatCR(monster.cr)}</span>
                  </div>
                )}
                {noArtShowAbilities && (
                  <div className="artwork-mode__fallback-clue">
                    <span className="artwork-mode__fallback-label">Abilities</span>
                    <span className="artwork-mode__fallback-value">
                      {[
                        { l: 'STR', v: monster.str },
                        { l: 'DEX', v: monster.dex },
                        { l: 'CON', v: monster.con },
                        { l: 'INT', v: monster.int },
                        { l: 'WIS', v: monster.wis },
                        { l: 'CHA', v: monster.cha },
                      ].filter(a => a.v !== undefined).map(a => `${a.l} ${a.v}`).join(', ')}
                    </span>
                  </div>
                )}
                {noArtShowMovement && (
                  <div className="artwork-mode__fallback-clue">
                    <span className="artwork-mode__fallback-label">Speed</span>
                    <span className="artwork-mode__fallback-value">{monster.movement.join(', ')}</span>
                  </div>
                )}
                {noArtShowSenses && monster.senses.length > 0 && (
                  <div className="artwork-mode__fallback-clue">
                    <span className="artwork-mode__fallback-label">Senses</span>
                    <span className="artwork-mode__fallback-value">{monster.senses.join(', ')}</span>
                  </div>
                )}
                {!noArtShowType && (
                  <p className="artwork-mode__fallback-hint">Make guesses to reveal more clues...</p>
                )}
              </div>
            </div>
          )}

          {hasArt && g > 0 && (
            <p className="artwork-mode__hint-text">
              Blur: {blur > 0 ? `${blur.toFixed(1)}px remaining` : 'Clear!'}
            </p>
          )}
        </div>
      )}

      {/* Lore hint cards — delayed schedule */}
      {(showLore || showTraits || showSource) && !showName && (
        <div className="hint-cards">
          {showLore && (
            <div className="hint-cards__card">
              <span className="hint-cards__label">Ancient Lore</span>
              <p className="hint-cards__text">{redactName(monster.lore!, monster.name)}</p>
            </div>
          )}
          {showTraits && (
            <div className="hint-cards__card">
              <span className="hint-cards__label">Known Traits</span>
              <p className="hint-cards__text">
                {monster.traits!.map(t => redactName(t, monster.name)).join(', ')}
              </p>
            </div>
          )}
          {showSource && (
            <div className="hint-cards__card">
              <span className="hint-cards__label">Origin</span>
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

import { useState } from 'react';
import type { Monster, NameGuess } from '../types';
import { SearchBar } from './SearchBar';
import { NameGuessList } from './NameGuessList';
import './StatBlockMode.css';

interface StatBlockModeProps {
  monster: Monster;
  monsters: Monster[];
  guesses: NameGuess[];
  guessedIds: Set<number>;
  solved: boolean;
  gameOver: boolean;
  onGuess: (monster: Monster) => void;
}

function mod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

function redactName(text: string, name: string): string {
  // Redact full name and each individual word (for compound names like "Fire Giant")
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

function formatAlignment(alignment: Monster['alignment']): string {
  if (alignment === 'unaligned') return 'unaligned';
  const law = alignment.law === 'L' ? 'lawful' : alignment.law === 'C' ? 'chaotic' : 'neutral';
  const moral = alignment.moral === 'G' ? 'good' : alignment.moral === 'E' ? 'evil' : 'neutral';
  return `${law} ${moral}`;
}

export function StatBlockMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: StatBlockModeProps) {
  const [imgError, setImgError] = useState(false);
  const showName = solved || gameOver;
  const g = guesses.length;

  // Progressive reveal tiers
  const showAbilities = true;                    // Always: ability scores
  const showAcHp = g >= 1 || showName;           // After 1 guess: AC + HP
  const showMovement = g >= 2 || showName;       // After 2 guesses: Speed
  const showSensesCR = g >= 3 || showName;       // After 3 guesses: Senses + CR
  const showSizeType = g >= 4 || showName;       // After 4 guesses: Size + Type
  const showTraitsActions = g >= 5 || showName;  // After 5 guesses: Traits + Actions
  const showLangAlign = g >= 6 || showName;      // After 6 guesses: Languages + Alignment
  const showLore = g >= 7 || showName;           // After 7 guesses: Lore hint

  const imageUrl = monster.artworkUrl || monster.tokenUrl;

  return (
    <div className="statblock-mode">
      {/* Reveal splash on solve/give-up */}
      {showName && (
        <div className="statblock-mode__reveal">
          {imageUrl && !imgError && (
            <div className="statblock-mode__reveal-art">
              <img
                src={imageUrl}
                alt={monster.name}
                className="statblock-mode__reveal-img"
                onError={() => setImgError(true)}
              />
            </div>
          )}
          <h2 className="statblock-mode__reveal-name">{monster.name}</h2>
          <p className="statblock-mode__reveal-meta">
            {monster.size} {monster.type}, {formatAlignment(monster.alignment)} — CR {formatCR(monster.cr)}
          </p>
        </div>
      )}

      {/* Stat block card */}
      <div className="statblock">
        <div className="statblock__header">
          <h2 className="statblock__name">
            {showName ? monster.name : '???'}
          </h2>
          {showSizeType ? (
            <p className="statblock__meta">
              {monster.size} {monster.type}
              {showLangAlign && monster.alignment !== 'unaligned'
                ? `, ${formatAlignment(monster.alignment)}`
                : showLangAlign ? ', unaligned' : ''
              }
            </p>
          ) : (
            <p className="statblock__meta statblock__meta--hidden">
              Size and type revealed after 4 guesses
            </p>
          )}
        </div>

        <div className="statblock__divider" />

        {/* AC / HP / Speed — progressive */}
        <div className="statblock__props">
          {showAcHp ? (
            <>
              {monster.ac !== undefined && (
                <div className="statblock__prop">
                  <span className="statblock__prop-label">Armor Class</span>
                  <span className="statblock__prop-value">
                    {monster.ac}{monster.acFrom ? ` (${monster.acFrom})` : ''}
                  </span>
                </div>
              )}
              {monster.hp !== undefined && (
                <div className="statblock__prop">
                  <span className="statblock__prop-label">Hit Points</span>
                  <span className="statblock__prop-value">
                    {monster.hp}{monster.hpFormula ? ` (${monster.hpFormula})` : ''}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="statblock__locked-inline">
              AC and HP revealed after 1 guess
            </div>
          )}
          {showMovement ? (
            <div className="statblock__prop">
              <span className="statblock__prop-label">Speed</span>
              <span className="statblock__prop-value">{monster.movement.join(', ')}</span>
            </div>
          ) : showAcHp ? (
            <div className="statblock__locked-inline">
              Speed revealed after 2 guesses
            </div>
          ) : null}
        </div>

        <div className="statblock__divider" />

        {/* Ability Scores — always visible */}
        {showAbilities && (
          <div className="statblock__abilities">
            {[
              { label: 'STR', val: monster.str },
              { label: 'DEX', val: monster.dex },
              { label: 'CON', val: monster.con },
              { label: 'INT', val: monster.int },
              { label: 'WIS', val: monster.wis },
              { label: 'CHA', val: monster.cha },
            ].map(({ label, val }) => (
              <div key={label} className="statblock__ability">
                <span className="statblock__ability-label">{label}</span>
                <span className="statblock__ability-value">
                  {val !== undefined ? `${val} (${mod(val)})` : '\u2014'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="statblock__divider" />

        {/* Senses, Languages, CR — progressive */}
        <div className="statblock__props">
          {showSensesCR ? (
            <>
              {monster.senses.length > 0 && (
                <div className="statblock__prop">
                  <span className="statblock__prop-label">Senses</span>
                  <span className="statblock__prop-value">{monster.senses.join(', ')}</span>
                </div>
              )}
              <div className="statblock__prop">
                <span className="statblock__prop-label">Challenge</span>
                <span className="statblock__prop-value">{formatCR(monster.cr)}</span>
              </div>
            </>
          ) : (
            <div className="statblock__locked-inline">
              Senses and CR revealed after 3 guesses
            </div>
          )}
          {showLangAlign && monster.languages && monster.languages.length > 0 && (
            <div className="statblock__prop">
              <span className="statblock__prop-label">Languages</span>
              <span className="statblock__prop-value">{monster.languages.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="statblock__divider" />

        {/* Traits + Actions — after 5 guesses */}
        {showTraitsActions ? (
          <>
            {monster.traits && monster.traits.length > 0 && (
              <div className="statblock__section">
                <h3 className="statblock__section-title">Traits</h3>
                <ul className="statblock__list">
                  {monster.traits.map((t, i) => (
                    <li key={i}>{showName ? t : redactName(t, monster.name)}</li>
                  ))}
                </ul>
              </div>
            )}
            {monster.actions && monster.actions.length > 0 && (
              <div className="statblock__section">
                <h3 className="statblock__section-title">Actions</h3>
                <ul className="statblock__list">
                  {monster.actions.map((a, i) => (
                    <li key={i}>{showName ? a : redactName(a, monster.name)}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="statblock__locked">
            {g < 1
              ? 'Make your first guess to begin revealing the stat block...'
              : `${5 - g} more guess${5 - g === 1 ? '' : 'es'} until traits and actions`}
          </div>
        )}
      </div>

      {/* Lore hint — after 7 guesses */}
      {showLore && !showName && monster.lore && (
        <div className="hint-cards">
          <div className="hint-cards__card">
            <span className="hint-cards__label">Ancient Lore</span>
            <p className="hint-cards__text">{redactName(monster.lore, monster.name)}</p>
          </div>
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

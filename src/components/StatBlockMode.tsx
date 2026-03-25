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

export function StatBlockMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: StatBlockModeProps) {
  const showName = solved || gameOver;
  // Progressive reveals: more info with more guesses
  const showAbilities = true; // Always show ability scores
  const showAcHp = true; // Always show AC/HP
  const showTraits = guesses.length >= 2 || showName;
  const showActions = guesses.length >= 3 || showName;
  const showLanguages = guesses.length >= 4 || showName;
  const showMovement = guesses.length >= 1 || showName;

  return (
    <div className="statblock-mode">
      {/* Stat block card */}
      <div className="statblock">
        <div className="statblock__header">
          <h2 className="statblock__name">
            {showName ? monster.name : '???'}
          </h2>
          <p className="statblock__meta">
            {monster.size} {monster.type}
            {monster.alignment !== 'unaligned'
              ? `, ${monster.alignment.law === 'L' ? 'lawful' : monster.alignment.law === 'C' ? 'chaotic' : 'neutral'} ${monster.alignment.moral === 'G' ? 'good' : monster.alignment.moral === 'E' ? 'evil' : 'neutral'}`
              : ', unaligned'
            }
          </p>
        </div>

        <div className="statblock__divider" />

        {/* AC / HP / Speed */}
        {showAcHp && (
          <div className="statblock__props">
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
            {showMovement && (
              <div className="statblock__prop">
                <span className="statblock__prop-label">Speed</span>
                <span className="statblock__prop-value">{monster.movement.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        <div className="statblock__divider" />

        {/* Ability Scores */}
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
                  {val !== undefined ? `${val} (${mod(val)})` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="statblock__divider" />

        {/* Senses, Languages, CR */}
        <div className="statblock__props">
          {monster.senses.length > 0 && (
            <div className="statblock__prop">
              <span className="statblock__prop-label">Senses</span>
              <span className="statblock__prop-value">{monster.senses.join(', ')}</span>
            </div>
          )}
          {showLanguages && monster.languages && monster.languages.length > 0 && (
            <div className="statblock__prop">
              <span className="statblock__prop-label">Languages</span>
              <span className="statblock__prop-value">{monster.languages.join(', ')}</span>
            </div>
          )}
          <div className="statblock__prop">
            <span className="statblock__prop-label">Challenge</span>
            <span className="statblock__prop-value">{formatCR(monster.cr)}</span>
          </div>
        </div>

        <div className="statblock__divider" />

        {/* Traits */}
        {showTraits && monster.traits && monster.traits.length > 0 && (
          <div className="statblock__section">
            <h3 className="statblock__section-title">Traits</h3>
            <ul className="statblock__list">
              {monster.traits.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {showActions && monster.actions && monster.actions.length > 0 && (
          <div className="statblock__section">
            <h3 className="statblock__section-title">Actions</h3>
            <ul className="statblock__list">
              {monster.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {!showTraits && !showActions && (
          <div className="statblock__locked">
            More details unlock with each guess...
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

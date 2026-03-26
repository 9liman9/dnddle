import { useState, useEffect, useCallback, useRef } from 'react';
import type { Spell, SpellGuessFeedback } from '../types/spell';
import { loadSpells } from '../lib/spells';
import { compareSpells } from '../lib/spell-compare';
import { getDailyMonsterIndex } from '../lib/daily';
import { SpellSearchBar } from './SpellSearchBar';
import './SpelldleMode.css';

interface SpelldleModeProps {
  dateString: string;
  isRandom: boolean;
  onPickRandom: () => void;
}

const SCHOOL_COLORS: Record<string, string> = {
  Abjuration: '#4a9eff',
  Conjuration: '#f0a030',
  Divination: '#c0c0c0',
  Enchantment: '#ff69b4',
  Evocation: '#ff4444',
  Illusion: '#a855f7',
  Necromancy: '#55cc55',
  Transmutation: '#ffcc00',
};

const COLUMNS = ['Spell', 'Level', 'School', 'Cast', 'Range', 'Comp.', 'Duration', 'Conc.'];

function redactName(text: string, name: string): string {
  return text.replace(
    new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    '█████'
  );
}

export function SpelldleMode({ dateString, isRandom }: SpelldleModeProps) {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [dailySpell, setDailySpell] = useState<Spell | null>(null);
  const [guesses, setGuesses] = useState<SpellGuessFeedback[]>([]);
  const [solved, setSolved] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [guessedIds, setGuessedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    loadSpells().then(data => {
      setSpells(data);
      const idx = getDailyMonsterIndex(data.length, undefined, 'spelldle');
      setDailySpell(data[idx]);
      setLoading(false);
    });
  }, []);

  // Restore saved game
  useEffect(() => {
    if (!dailySpell || spells.length === 0 || isRandom || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const stored = localStorage.getItem('dnddle-game-spelldle');
      if (!stored) return;
      const saved = JSON.parse(stored);
      if (saved.date !== dateString) return;
      const restored: SpellGuessFeedback[] = [];
      const ids = new Set<number>();
      for (const name of saved.guessNames) {
        const spell = spells.find(s => s.name === name);
        if (spell) {
          restored.push(compareSpells(spell, dailySpell));
          ids.add(spell.id);
        }
      }
      if (restored.length > 0) {
        setGuesses(restored);
        setGuessedIds(ids);
        setSolved(saved.solved);
        setGaveUp(saved.gaveUp);
      }
    } catch { /* ignore */ }
  }, [dailySpell, spells, dateString, isRandom]);

  const submitGuess = useCallback((spell: Spell) => {
    if (!dailySpell || solved || gaveUp) return;
    const feedback = compareSpells(spell, dailySpell);
    const isCorrect = Object.values(feedback.cells).every(c => c.feedback === 'match');

    setGuesses(prev => {
      const updated = [...prev, feedback];
      if (!isRandom) {
        localStorage.setItem('dnddle-game-spelldle', JSON.stringify({
          date: dateString,
          guessNames: updated.map(g => g.spell.name),
          solved: isCorrect,
          gaveUp: false,
        }));
      }
      return updated;
    });
    setGuessedIds(prev => new Set([...prev, spell.id]));
    if (isCorrect) setSolved(true);
  }, [dailySpell, solved, gaveUp, dateString, isRandom]);

  const gameOver = solved || gaveUp;
  const showName = solved || gaveUp;
  const g = guesses.length;

  const pickRandomSpell = useCallback(() => {
    if (spells.length === 0) return;
    const idx = Math.floor(Math.random() * spells.length);
    setDailySpell(spells[idx]);
    setGuesses([]);
    setSolved(false);
    setGaveUp(false);
    setGuessedIds(new Set());
    setImgError(false);
    restoredRef.current = true;
  }, [spells]);

  const handleGiveUp = useCallback(() => {
    if (solved || gaveUp) return;
    setGaveUp(true);
  }, [solved, gaveUp]);

  if (loading || !dailySpell) return <div className="loading">Loading the spellbook...</div>;

  const schoolColor = SCHOOL_COLORS[dailySpell.schoolFull] || 'var(--gold)';

  return (
    <div className="spelldle-mode">
      {/* Mode bar with random/give up */}
      <div className="spell-mode-bar">
        <button className="spell-mode-bar__btn" onClick={pickRandomSpell}>
          🎲 Random Spell
        </button>
        {!gameOver && g >= 1 && (
          <button className="spell-mode-bar__btn spell-mode-bar__btn--giveup" onClick={handleGiveUp}>
            🏳 Give Up
          </button>
        )}
        {gameOver && (
          <button className="spell-mode-bar__btn spell-mode-bar__btn--play" onClick={pickRandomSpell}>
            ⚔ Play Again
          </button>
        )}
      </div>

      {/* Spell hint panel */}
      <div className="spell-hint" style={{ borderColor: showName ? schoolColor : 'var(--border)' }}>
        {/* School badge */}
        <div className="spell-hint__school" style={{ background: showName ? schoolColor : 'var(--bg-elevated)' }}>
          {showName ? dailySpell.schoolFull : '???'}
        </div>

        <h2 className="spell-hint__name">
          {showName ? dailySpell.name : 'Mystery Spell'}
        </h2>

        {showName && (
          <p className="spell-hint__meta">
            {dailySpell.level === 0 ? 'Cantrip' : `Level ${dailySpell.level}`} {dailySpell.schoolFull} — {dailySpell.sourceFull}
          </p>
        )}

        {/* Spell description hint (redacted, after 2 guesses) */}
        {dailySpell.description && (g >= 2 || showName) && (
          <div className="spell-hint__desc">
            <span className="spell-hint__label">📜 Scroll Text</span>
            <p>{showName ? dailySpell.description : redactName(dailySpell.description, dailySpell.name)}</p>
          </div>
        )}

        {/* Material component hint (after 4 guesses) */}
        {dailySpell.materialText && (g >= 4 || showName) && (
          <div className="spell-hint__material">
            <span className="spell-hint__label">🧪 Material Component</span>
            <p>"{dailySpell.materialText}"</p>
          </div>
        )}

        {/* Damage type hint (after 3 guesses) */}
        {dailySpell.damageType && (g >= 3 || showName) && (
          <div className="spell-hint__clue">
            <span className="spell-hint__label">💥 Damage Type</span>
            <span className="spell-hint__clue-value">{dailySpell.damageType}</span>
          </div>
        )}

        {/* Source book hint (after 6 guesses) */}
        {g >= 6 && !showName && (
          <div className="spell-hint__clue">
            <span className="spell-hint__label">📖 Source</span>
            <span className="spell-hint__clue-value">{dailySpell.sourceFull}</span>
          </div>
        )}

        {/* Artwork on solve */}
        {showName && dailySpell.artworkUrl && !imgError && (
          <div className="spell-hint__art">
            <img
              src={dailySpell.artworkUrl}
              alt={dailySpell.name}
              className="spell-hint__art-img"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        {/* Locked hints */}
        {g < 2 && !showName && (
          <p className="spell-hint__locked">📜 Scroll text unlocks after 2 guesses</p>
        )}
      </div>

      <SpellSearchBar
        spells={spells}
        guessedIds={guessedIds}
        onGuess={submitGuess}
        disabled={gameOver}
      />

      {/* Grid — newest first */}
      <div className="spell-grid">
        <div className="spell-grid__header">
          {COLUMNS.map(col => (
            <div key={col} className="spell-grid__col-label">{col}</div>
          ))}
        </div>

        {[...guesses].reverse().map((guess, i) => {
          const allMatch = Object.values(guess.cells).every(c => c.feedback === 'match');
          return (
            <div key={guesses.length - 1 - i} className="spell-grid__row" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`spell-grid__name ${allMatch ? 'spell-grid__name--match' : ''}`}>
                {guess.spell.name}
              </div>
              {Object.entries(guess.cells).map(([key, cell]) => (
                <div
                  key={key}
                  className={`spell-grid__cell spell-grid__cell--${cell.feedback}`}
                  title={cell.value}
                >
                  <span className="spell-grid__cell-value">{cell.value}</span>
                  {(cell.feedback === 'higher' || cell.feedback === 'lower') && (
                    <span className={`spell-grid__arrow spell-grid__arrow--${cell.feedback}`}>
                      {cell.feedback === 'higher' ? '⬆' : '⬇'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {gameOver && !solved && (
        <div className="game-over">
          <p>The spell was <strong>{dailySpell.name}</strong></p>
        </div>
      )}
    </div>
  );
}

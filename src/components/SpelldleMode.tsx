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

const COLUMNS = ['Spell', 'Level', 'School', 'Cast', 'Range', 'Comp.', 'Duration', 'Conc.'];

export function SpelldleMode({ dateString, isRandom }: SpelldleModeProps) {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [dailySpell, setDailySpell] = useState<Spell | null>(null);
  const [guesses, setGuesses] = useState<SpellGuessFeedback[]>([]);
  const [solved, setSolved] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [guessedIds, setGuessedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
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
    } catch { /* ignore corrupted storage */ }
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

  if (loading) return <div className="loading">Loading the spellbook...</div>;

  return (
    <div className="spelldle-mode">
      <SpellSearchBar
        spells={spells}
        guessedIds={guessedIds}
        onGuess={submitGuess}
        disabled={gameOver}
      />

      {/* Grid */}
      <div className="spell-grid">
        <div className="spell-grid__header">
          {COLUMNS.map(col => (
            <div key={col} className="spell-grid__col-label">{col}</div>
          ))}
        </div>

        {guesses.map((guess, i) => {
          const allMatch = Object.values(guess.cells).every(c => c.feedback === 'match');
          return (
            <div key={i} className="spell-grid__row" style={{ animationDelay: `${i * 0.05}s` }}>
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
                      {cell.feedback === 'higher' ? '\u2B06' : '\u2B07'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {gameOver && !solved && dailySpell && (
        <div className="game-over">
          <p>The spell was <strong>{dailySpell.name}</strong></p>
          <p style={{ fontSize: '16px', color: 'var(--text-dim)', marginTop: '8px' }}>
            Level {dailySpell.level === 0 ? 'Cantrip' : dailySpell.level} {dailySpell.schoolFull} — {dailySpell.sourceFull}
          </p>
        </div>
      )}
    </div>
  );
}

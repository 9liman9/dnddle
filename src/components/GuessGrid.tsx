import type { GuessFeedback } from '../types';
import { GuessRow } from './GuessRow';
import './GuessGrid.css';

interface GuessGridProps {
  guesses: GuessFeedback[];
}

const COLUMNS = ['Creature', 'Size', 'Type', 'CR', 'Align', 'Biome', 'Move', 'Senses'];

export function GuessGrid({ guesses }: GuessGridProps) {
  return (
    <div className="guess-grid">
      <div className="guess-grid__header">
        {COLUMNS.map(col => (
          <div key={col} className="guess-grid__col-label">{col}</div>
        ))}
      </div>

      <div className="guess-grid__rows">
        {[...guesses].reverse().map((guess, i) => (
          <GuessRow key={guesses.length - 1 - i} guess={guess} index={i} isLatest={i === 0} />
        ))}
      </div>
    </div>
  );
}

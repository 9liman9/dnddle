import type { GuessFeedback } from '../types';
import { FeedbackCell } from './FeedbackCell';
import './GuessRow.css';

interface GuessRowProps {
  guess: GuessFeedback;
  index: number;
  isLatest: boolean;
}

export function GuessRow({ guess, index, isLatest }: GuessRowProps) {
  const { monster, cells } = guess;
  const allMatch = Object.values(cells).every(c => c.feedback === 'match');

  return (
    <div
      className={`guess-row ${isLatest ? 'guess-row--latest' : ''} ${allMatch ? 'guess-row--solved' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={`guess-row__name ${allMatch ? 'guess-row__name--match' : ''}`}>
        {monster.name}
      </div>
      <FeedbackCell cell={cells.size} delay={0} />
      <FeedbackCell cell={cells.type} delay={1} />
      <FeedbackCell cell={cells.cr} delay={2} />
      <FeedbackCell cell={cells.alignment} delay={3} />
      <FeedbackCell cell={cells.biome} delay={4} />
      <FeedbackCell cell={cells.movement} delay={5} />
      <FeedbackCell cell={cells.senses} delay={6} />
    </div>
  );
}

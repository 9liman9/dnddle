import type { CellFeedback } from '../types';
import './FeedbackCell.css';

interface FeedbackCellProps {
  cell: CellFeedback;
  delay: number;
}

const ARROW_MAP: Record<string, string> = {
  higher: '⬆',
  lower: '⬇',
};

export function FeedbackCell({ cell, delay }: FeedbackCellProps) {
  const arrow = ARROW_MAP[cell.feedback] || '';
  return (
    <div
      className={`feedback-cell feedback-cell--${cell.feedback}`}
      style={{ animationDelay: `${delay * 0.1}s` }}
      title={cell.fullValue || cell.value}
    >
      <span className="feedback-cell__value">
        {cell.value}
      </span>
      {arrow && <span className={`feedback-cell__arrow feedback-cell__arrow--${cell.feedback}`}>{arrow}</span>}
    </div>
  );
}

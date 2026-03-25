import type { NameGuess } from '../types';
import './NameGuessList.css';

interface NameGuessListProps {
  guesses: NameGuess[];
}

export function NameGuessList({ guesses }: NameGuessListProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="name-guess-list">
      <h3 className="name-guess-list__title">Guesses ({guesses.length})</h3>
      <div className="name-guess-list__items">
        {guesses.map((guess, i) => (
          <div
            key={i}
            className={`name-guess-list__item ${guess.correct ? 'name-guess-list__item--correct' : 'name-guess-list__item--wrong'}`}
          >
            {guess.tokenUrl && (
              <img
                src={guess.tokenUrl}
                alt=""
                className="name-guess-list__token"
                loading="lazy"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <span className="name-guess-list__name">{guess.name}</span>
            <span className="name-guess-list__icon">{guess.correct ? '\u2713' : '\u2717'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

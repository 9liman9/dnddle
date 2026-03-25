import { useState, useRef, useEffect } from 'react';
import type { Monster } from '../types';
import { searchMonsters } from '../lib/monsters';
import './SearchBar.css';

interface SearchBarProps {
  monsters: Monster[];
  guessedIds: Set<number>;
  onGuess: (monster: Monster) => void;
  disabled: boolean;
}

export function SearchBar({ monsters, guessedIds, onGuess, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Monster[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 1) {
      const filtered = searchMonsters(monsters, query)
        .filter(m => !guessedIds.has(m.id));
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightIdx(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, monsters, guessedIds]);

  function handleSelect(monster: Monster) {
    onGuess(monster);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIdx]);

  return (
    <div className="search-bar">
      <div className="search-bar__input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder="Speak the creature's name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        <span className="search-bar__icon">🔍</span>
      </div>

      {isOpen && (
        <div className="search-bar__dropdown" ref={listRef}>
          {results.map((monster, i) => (
            <button
              key={monster.id}
              className={`search-bar__option ${i === highlightIdx ? 'search-bar__option--highlight' : ''}`}
              onClick={() => handleSelect(monster)}
              onMouseEnter={() => setHighlightIdx(i)}
            >
              <div className="search-bar__option-left">
                {monster.tokenUrl && (
                  <img
                    src={monster.tokenUrl}
                    alt=""
                    className="search-bar__option-token"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <span className="search-bar__option-name">{monster.name}</span>
              </div>
              <span className="search-bar__option-source">{monster.source}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

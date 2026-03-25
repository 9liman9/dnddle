import { useState, useRef, useEffect } from 'react';
import type { Spell } from '../types/spell';
import { searchSpells } from '../lib/spells';
import './SearchBar.css';

interface SpellSearchBarProps {
  spells: Spell[];
  guessedIds: Set<number>;
  onGuess: (spell: Spell) => void;
  disabled: boolean;
}

export function SpellSearchBar({ spells, guessedIds, onGuess, disabled }: SpellSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Spell[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 1) {
      const filtered = searchSpells(spells, query).filter(s => !guessedIds.has(s.id));
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightIdx(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, spells, guessedIds]);

  function handleSelect(spell: Spell) {
    onGuess(spell);
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

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIdx]) items[highlightIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  return (
    <div className="search-bar">
      <div className="search-bar__input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="search-bar__input"
          placeholder="Name the spell..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        <span className="search-bar__icon">✨</span>
      </div>

      {isOpen && (
        <div className="search-bar__dropdown" ref={listRef}>
          {results.map((spell, i) => (
            <button
              key={spell.id}
              className={`search-bar__option ${i === highlightIdx ? 'search-bar__option--highlight' : ''}`}
              onClick={() => handleSelect(spell)}
              onMouseEnter={() => setHighlightIdx(i)}
            >
              <div className="search-bar__option-left">
                <span className="spell-search__level">{spell.level === 0 ? 'C' : spell.level}</span>
                <span className="search-bar__option-name">{spell.name}</span>
              </div>
              <span className="search-bar__option-source">{spell.schoolFull}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

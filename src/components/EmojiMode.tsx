import { useState, useMemo } from 'react';
import type { Monster, NameGuess } from '../types';
import { SearchBar } from './SearchBar';
import { NameGuessList } from './NameGuessList';
import './EmojiMode.css';

interface EmojiModeProps {
  monster: Monster;
  monsters: Monster[];
  guesses: NameGuess[];
  guessedIds: Set<number>;
  solved: boolean;
  gameOver: boolean;
  onGuess: (monster: Monster) => void;
}

// Generate emoji clues based on monster attributes
function generateEmojis(monster: Monster): string[][] {
  const clues: string[][] = [];

  const typeEmojis: Record<string, string> = {
    'aberration': '\uD83E\uDDE0',
    'beast': '\uD83D\uDC3E',
    'celestial': '\uD83D\uDC7C',
    'construct': '\u2699\uFE0F',
    'dragon': '\uD83D\uDC09',
    'elemental': '\uD83C\uDF0A',
    'fey': '\uD83E\uDDDA',
    'fiend': '\uD83D\uDE08',
    'giant': '\uD83D\uDDFF',
    'humanoid': '\uD83E\uDDD1',
    'monstrosity': '\uD83D\uDC79',
    'ooze': '\uD83E\uDEE0',
    'plant': '\uD83C\uDF3F',
    'undead': '\uD83D\uDC80',
  };

  const sizeEmojis: Record<string, string> = {
    'Tiny': '\uD83D\uDC1C',
    'Small': '\uD83D\uDC08',
    'Medium': '\uD83E\uDDCD',
    'Large': '\uD83D\uDC18',
    'Huge': '\uD83E\uDD95',
    'Gargantuan': '\uD83C\uDF0B',
  };

  // Clue 1: size + type
  clues.push([
    sizeEmojis[monster.size] || '?',
    typeEmojis[monster.type] || '?',
  ]);

  // Clue 2: Biome/environment
  const biomeEmojis: Record<string, string> = {
    'forest': '\uD83C\uDF32',
    'underdark': '\uD83D\uDD73\uFE0F',
    'mountain': '\uD83C\uDFD4\uFE0F',
    'coast': '\uD83C\uDFD6\uFE0F',
    'desert': '\uD83C\uDFDC\uFE0F',
    'swamp': '\uD83C\uDF3F',
    'arctic': '\u2744\uFE0F',
    'grassland': '\uD83C\uDF3E',
    'urban': '\uD83C\uDFF0',
    'underwater': '\uD83C\uDF0A',
    'hill': '\u26F0\uFE0F',
  };
  if (monster.biomes.length > 0) {
    clues.push(monster.biomes.slice(0, 3).map(b => biomeEmojis[b] || '\uD83D\uDDFA\uFE0F'));
  } else {
    clues.push(['\uD83C\uDF0D']);
  }

  // Clue 3: Movement
  const moveEmojis: Record<string, string> = {
    'walk': '\uD83D\uDEB6',
    'fly': '\uD83E\uDD85',
    'swim': '\uD83C\uDFCA',
    'burrow': '\uD83D\uDD73\uFE0F',
    'climb': '\uD83E\uDDD7',
    'hover': '\uD83C\uDF88',
  };
  clues.push(monster.movement.map(m => moveEmojis[m] || '?'));

  // Clue 4: CR-based danger level
  const cr = monster.cr;
  if (cr <= 1) clues.push(['\uD83D\uDE0A', '\u2694\uFE0F']);
  else if (cr <= 5) clues.push(['\uD83D\uDE30', '\u2694\uFE0F', '\u2694\uFE0F']);
  else if (cr <= 10) clues.push(['\uD83D\uDE31', '\u2694\uFE0F', '\u2694\uFE0F', '\u2694\uFE0F']);
  else if (cr <= 20) clues.push(['\uD83D\uDC80', '\u2694\uFE0F', '\u2694\uFE0F', '\u2694\uFE0F', '\u2694\uFE0F']);
  else clues.push(['\u2620\uFE0F', '\uD83D\uDD25', '\uD83D\uDC80', '\u2694\uFE0F', '\u2694\uFE0F']);

  // Clue 5: Senses
  const senseEmojis: Record<string, string> = {
    'darkvision': '\uD83C\uDF19',
    'blindsight': '\uD83E\uDD87',
    'tremorsense': '\u3030\uFE0F',
    'truesight': '\uD83D\uDC41\uFE0F',
  };
  if (monster.senses.length > 0) {
    clues.push(monster.senses.map(s => senseEmojis[s] || '\uD83D\uDC40'));
  } else {
    clues.push(['\uD83D\uDC40']);
  }

  return clues;
}

export function EmojiMode({ monster, monsters, guesses, guessedIds, solved, gameOver, onGuess }: EmojiModeProps) {
  const showName = solved || gameOver;
  const [imgError, setImgError] = useState(false);
  const imageUrl = monster.artworkUrl || monster.tokenUrl;

  const emojiClues = useMemo(() => generateEmojis(monster), [monster]);

  // Progressive reveal: show more emoji clues with each guess
  const visibleClues = showName
    ? emojiClues.length
    : Math.min(1 + guesses.length, emojiClues.length);

  return (
    <div className="emoji-mode">
      <div className="emoji-mode__card">
        <h2 className="emoji-mode__title">
          {showName ? monster.name : 'Decode the Creature'}
        </h2>
        <p className="emoji-mode__subtitle">
          {showName
            ? `${monster.size} ${monster.type}`
            : 'Each guess reveals a new emoji clue'}
        </p>

        <div className="emoji-mode__clues">
          {emojiClues.slice(0, visibleClues).map((clue, i) => (
            <div key={i} className="emoji-mode__clue-row" style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="emoji-mode__clue-number">{i + 1}</span>
              <div className="emoji-mode__emojis">
                {clue.map((emoji, j) => (
                  <span key={j} className="emoji-mode__emoji">{emoji}</span>
                ))}
              </div>
            </div>
          ))}

          {!showName && visibleClues < emojiClues.length && (
            <div className="emoji-mode__locked">
              {emojiClues.length - visibleClues} more clue{emojiClues.length - visibleClues > 1 ? 's' : ''} remaining
            </div>
          )}
        </div>

        {/* Reveal artwork on solve */}
        {showName && imageUrl && !imgError && (
          <div className="emoji-mode__reveal">
            <img
              src={imageUrl}
              alt={monster.name}
              className="emoji-mode__reveal-img"
              onError={() => setImgError(true)}
            />
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

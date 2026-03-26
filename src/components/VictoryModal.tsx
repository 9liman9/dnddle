import { useState } from 'react';
import type { Monster, GuessFeedback, GameMode } from '../types';
import { generateShareString, copyToClipboard } from '../lib/share';
import './VictoryModal.css';

interface VictoryModalProps {
  monster: Monster;
  guesses: GuessFeedback[];
  guessCount: number;
  dailyNumber: number;
  solved: boolean;
  mode: GameMode;
  onClose: () => void;
  onPlayAgain: () => void;
}

const LAW: Record<string, string> = { L: 'Lawful', N: 'Neutral', C: 'Chaotic' };
const MORAL: Record<string, string> = { G: 'Good', N: 'Neutral', E: 'Evil' };

function fmtAlign(a: Monster['alignment']): string {
  if (a === 'unaligned') return 'Unaligned';
  const l = LAW[a.law] || a.law;
  const m = MORAL[a.moral] || a.moral;
  return l === 'Neutral' && m === 'Neutral' ? 'True Neutral' : `${l} ${m}`;
}

function fmtCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

const MODE_NAMES: Record<GameMode, string> = {
  classic: 'Classic',
  artwork: 'Artwork',
  spelldle: "Spell'dle",
};

export function VictoryModal({ monster, guesses, guessCount, dailyNumber, solved, mode, onClose, onPlayAgain }: VictoryModalProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imageUrl = monster.artworkUrl || monster.tokenUrl;

  async function handleShare() {
    const shareText = generateShareString(guesses, dailyNumber);
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`hero-modal ${solved ? 'hero-modal--victory' : 'hero-modal--defeat'}`} onClick={e => e.stopPropagation()}>
        <button className="hero-modal__close" onClick={onClose}>✕</button>

        {/* Banner */}
        <div className={`hero-modal__banner ${solved ? 'hero-modal__banner--victory' : 'hero-modal__banner--defeat'}`}>
          <span className="hero-modal__banner-text">
            {solved ? '⚔ Victory! ⚔' : '💀 Defeated 💀'}
          </span>
          <span className="hero-modal__banner-mode">{MODE_NAMES[mode]} Mode</span>
          <span className="hero-modal__banner-sub">
            {solved
              ? `Solved in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}`
              : `The creature eluded you after ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}`
            }
          </span>
        </div>

        {/* Hero art */}
        {imageUrl && !imgError && (
          <div className="hero-modal__art">
            <img
              src={imageUrl}
              alt={monster.name}
              className="hero-modal__img"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        {/* Name */}
        <h2 className="hero-modal__name">{monster.name}</h2>
        <p className="hero-modal__type-line">
          {monster.size} {monster.type} — CR {fmtCR(monster.cr)}
        </p>

        {/* Stat block */}
        <div className="hero-modal__stats">
          <div className="hero-modal__stat-row">
            <span className="hero-modal__stat-label">Alignment</span>
            <span className="hero-modal__stat-value">{fmtAlign(monster.alignment)}</span>
          </div>
          {monster.biomes.length > 0 && (
            <div className="hero-modal__stat-row">
              <span className="hero-modal__stat-label">Biome</span>
              <span className="hero-modal__stat-value">{monster.biomes.join(', ')}</span>
            </div>
          )}
          <div className="hero-modal__stat-row">
            <span className="hero-modal__stat-label">Movement</span>
            <span className="hero-modal__stat-value">{monster.movement.join(', ')}</span>
          </div>
          {monster.senses.length > 0 && (
            <div className="hero-modal__stat-row">
              <span className="hero-modal__stat-label">Senses</span>
              <span className="hero-modal__stat-value">{monster.senses.join(', ')}</span>
            </div>
          )}
          {monster.traits && monster.traits.length > 0 && (
            <div className="hero-modal__stat-row">
              <span className="hero-modal__stat-label">Traits</span>
              <span className="hero-modal__stat-value">{monster.traits.join(', ')}</span>
            </div>
          )}
          <div className="hero-modal__stat-row">
            <span className="hero-modal__stat-label">Source</span>
            <span className="hero-modal__stat-value">📖 {monster.sourceFull}</span>
          </div>
        </div>

        {/* Lore */}
        {monster.lore && (
          <div className="hero-modal__lore">
            <p>{monster.lore}</p>
          </div>
        )}

        {/* Share grid */}
        {solved && (
          <div className="hero-modal__share-section">
            <div className="hero-modal__grid">
              {generateShareString(guesses, dailyNumber)}
            </div>
            <button className="hero-modal__share-btn" onClick={handleShare}>
              {copied ? '✓ Copied!' : 'SHARE THY CONQUEST'}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="hero-modal__actions">
          <button className="hero-modal__action-btn" onClick={onPlayAgain}>
            🎲 Play Again
          </button>
          <button className="hero-modal__action-btn hero-modal__action-btn--close" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

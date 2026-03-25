import { useState } from 'react';
import './HintPanel.css';

interface HintPanelProps {
  guessCount: number;
  tokenUrl?: string;
  artworkUrl?: string;
  solved: boolean;
  monsterName?: string;
  sourceFull?: string;
  source?: string;
  lore?: string;
  traits?: string[];
  size?: string;
  type?: string;
  cr?: number;
  alignment?: { law: string; moral: string } | 'unaligned';
  biomes?: string[];
  movement?: string[];
  senses?: string[];
}

const HINT_STAGES = [
  { threshold: 3, blur: 12, label: 'Arcane Vision I' },
  { threshold: 5, blur: 6, label: 'Arcane Vision II' },
  { threshold: 7, blur: 0, label: 'Arcane Vision III' },
];

const LAW_NAMES: Record<string, string> = { L: 'Lawful', N: 'Neutral', C: 'Chaotic' };
const MORAL_NAMES: Record<string, string> = { G: 'Good', N: 'Neutral', E: 'Evil' };

function formatAlign(a: { law: string; moral: string } | 'unaligned'): string {
  if (a === 'unaligned') return 'Unaligned';
  const l = LAW_NAMES[a.law] || a.law;
  const m = MORAL_NAMES[a.moral] || a.moral;
  return l === 'Neutral' && m === 'Neutral' ? 'True Neutral' : `${l} ${m}`;
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

export function HintPanel({
  guessCount, tokenUrl, artworkUrl, solved, monsterName,
  sourceFull, lore, traits, size, type, cr, alignment, biomes, movement, senses,
}: HintPanelProps) {
  const [imgError, setImgError] = useState(false);
  const activeStage = HINT_STAGES.filter(s => guessCount >= s.threshold).pop();
  const imageUrl = artworkUrl || tokenUrl;

  // Redact monster name from lore text
  const redactedLore = lore && monsterName
    ? lore.replace(new RegExp(monsterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '█████')
    : lore;

  // Lore hint unlocks at 2 guesses, traits at 4, source at 6
  const showLore = guessCount >= 2 && redactedLore;
  const showTraits = guessCount >= 4 && traits && traits.length > 0;
  const showSource = guessCount >= 6 && sourceFull;

  if (solved) {
    return (
      <div className="hint-panel hint-panel--solved">
        {imageUrl && !imgError && (
          <div className="hint-panel__splash">
            <img
              src={imageUrl}
              alt={monsterName || 'Monster'}
              className="hint-panel__splash-img"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        {monsterName && <p className="hint-panel__name">{monsterName}</p>}

        {/* Stat card */}
        <div className="reveal-card">
          <div className="reveal-card__stats">
            {size && type && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Type</span>
                <span className="reveal-card__value">{size} {type}</span>
              </div>
            )}
            {cr !== undefined && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">CR</span>
                <span className="reveal-card__value">{formatCR(cr)}</span>
              </div>
            )}
            {alignment && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Alignment</span>
                <span className="reveal-card__value">{formatAlign(alignment)}</span>
              </div>
            )}
            {biomes && biomes.length > 0 && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Biome</span>
                <span className="reveal-card__value">{biomes.join(', ')}</span>
              </div>
            )}
            {movement && movement.length > 0 && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Movement</span>
                <span className="reveal-card__value">{movement.join(', ')}</span>
              </div>
            )}
            {senses && senses.length > 0 && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Senses</span>
                <span className="reveal-card__value">{senses.join(', ')}</span>
              </div>
            )}
            {traits && traits.length > 0 && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Traits</span>
                <span className="reveal-card__value">{traits.join(', ')}</span>
              </div>
            )}
            {sourceFull && (
              <div className="reveal-card__row">
                <span className="reveal-card__label">Source</span>
                <span className="reveal-card__value">📖 {sourceFull}</span>
              </div>
            )}
          </div>

          {lore && (
            <div className="reveal-card__lore">
              <p>{lore}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hint-panel">
      {/* Text hints */}
      <div className="hint-panel__hints">
        {showLore && (
          <div className="hint-panel__hint-card">
            <span className="hint-panel__hint-label">📜 Ancient Lore</span>
            <p className="hint-panel__hint-text">{redactedLore}</p>
          </div>
        )}
        {showTraits && (
          <div className="hint-panel__hint-card">
            <span className="hint-panel__hint-label">⚡ Known Traits</span>
            <p className="hint-panel__hint-text">{traits!.join(', ')}</p>
          </div>
        )}
        {showSource && (
          <div className="hint-panel__hint-card">
            <span className="hint-panel__hint-label">📖 Origin</span>
            <p className="hint-panel__hint-text">{sourceFull}</p>
          </div>
        )}
        {!showLore && !showTraits && !showSource && guessCount < 2 && (
          <div className="hint-panel__hint-card hint-panel__hint-card--locked">
            <span className="hint-panel__hint-label">📜 Lore hint unlocks after 2 guesses</span>
          </div>
        )}
      </div>

      {/* Art hint */}
      <div className="hint-frame">
        <div className="hint-inner">
          {(!imageUrl || imgError || !activeStage) ? (
            <div className="hint-locked">
              <span className="hint-locked__icon">🔒</span>
              <span className="hint-locked__text">
                Arcane Vision unlocks after 3 guesses
              </span>
            </div>
          ) : (
            <>
              <div className="hint-panel__splash">
                <img
                  src={imageUrl}
                  alt="Hint"
                  className="hint-panel__splash-img"
                  style={{
                    filter: activeStage.blur > 0 ? `blur(${activeStage.blur}px)` : 'none',
                  }}
                  onError={() => setImgError(true)}
                />
              </div>
              <p className="hint-panel__label">{activeStage.label}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import './HelpModal.css';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <button className="help-modal__close" onClick={onClose}>✕</button>

        <h2 className="help-modal__title">How to Play</h2>

        <div className="help-modal__content">
          <p>Guess the daily D&D monster across 4 different game modes! A new puzzle in each mode every day at midnight UTC.</p>

          <h3>Classic Mode</h3>
          <p>Guess by comparing 7 attributes. Each guess shows color-coded feedback:</p>
          <div className="help-modal__colors">
            <div className="help-color">
              <span className="help-swatch help-swatch--match"></span>
              <span><strong>Green</strong> — Exact match</span>
            </div>
            <div className="help-color">
              <span className="help-swatch help-swatch--partial"></span>
              <span><strong>Gold</strong> — Partial match</span>
            </div>
            <div className="help-color">
              <span className="help-swatch help-swatch--wrong"></span>
              <span><strong>Dark</strong> — No match</span>
            </div>
            <div className="help-color">
              <span className="help-swatch help-swatch--wrong"></span>
              <span><strong>⬆⬇ Arrows</strong> — Answer is higher/lower (CR, Size)</span>
            </div>
          </div>

          <h3>Attributes (Classic)</h3>
          <ul className="help-modal__list">
            <li><strong>Size:</strong> Tiny → Small → Medium → Large → Huge → Gargantuan</li>
            <li><strong>Type:</strong> Creature type (Aberration, Beast, Dragon, etc.)</li>
            <li><strong>CR:</strong> Challenge Rating (0 to 30)</li>
            <li><strong>Alignment:</strong> Two axes — Law/Chaos + Good/Evil</li>
            <li><strong>Biome:</strong> Where the creature lives</li>
            <li><strong>Movement:</strong> How it moves (Walk, Fly, Swim, etc.)</li>
            <li><strong>Senses:</strong> What it can sense (Darkvision, Blindsight, etc.)</li>
          </ul>

          <h3>Artwork Mode</h3>
          <p>A heavily blurred piece of monster artwork is shown. Each wrong guess reduces the blur. Identify the creature from its art!</p>

          <h3>Stat Block Mode</h3>
          <p>A D&D stat block is shown with the name hidden. Use AC, HP, ability scores, traits, and actions to deduce the creature. More details reveal with each guess.</p>

          <h3>Lore Mode</h3>
          <p>A passage of lore is shown with the creature's name redacted. Use the description to identify the monster. Extra clues (type, CR, source) unlock with each guess.</p>

          <h3>Tips</h3>
          <ul className="help-modal__list">
            <li>Each mode has a <strong>different daily monster</strong></li>
            <li>Use <strong>🎲 Random</strong> for unlimited practice</li>
            <li>Lore hints unlock at 2 guesses, art hints at 3 (Classic mode)</li>
            <li>Hover over cells to see full details</li>
          </ul>

          <p className="help-modal__footer">2,571 monsters from all official D&D sourcebooks. New puzzles daily at midnight UTC.</p>
        </div>
      </div>
    </div>
  );
}

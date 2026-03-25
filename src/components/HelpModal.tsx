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
          <p>Guess the daily D&D monster! Each guess reveals clues across 7 attributes.</p>

          <h3>Color Guide</h3>
          <div className="help-modal__colors">
            <div className="help-color">
              <span className="help-swatch help-swatch--match"></span>
              <span><strong>Green</strong> — Exact match</span>
            </div>
            <div className="help-color">
              <span className="help-swatch help-swatch--partial"></span>
              <span><strong>Gold</strong> — Partial match (one axis or some overlap)</span>
            </div>
            <div className="help-color">
              <span className="help-swatch help-swatch--wrong"></span>
              <span><strong>Dark</strong> — No match</span>
            </div>
            <div className="help-color">
              <span className="help-swatch help-swatch--higher"></span>
              <span><strong>Red ⬆⬇</strong> — Answer is higher/lower (CR, Size)</span>
            </div>
          </div>

          <h3>Attributes</h3>
          <ul className="help-modal__list">
            <li><strong>Size:</strong> Tiny → Small → Medium → Large → Huge → Gargantuan</li>
            <li><strong>Type:</strong> Creature type (Aberration, Beast, Dragon, etc.)</li>
            <li><strong>CR:</strong> Challenge Rating (0 to 30)</li>
            <li><strong>Alignment:</strong> Two axes — Law/Chaos + Good/Evil</li>
            <li><strong>Biome:</strong> Where the creature lives (Forest, Underdark, etc.)</li>
            <li><strong>Movement:</strong> How it moves (Walk, Fly, Swim, Burrow, etc.)</li>
            <li><strong>Senses:</strong> What it can sense (Darkvision, Blindsight, etc.)</li>
          </ul>

          <h3>Hints</h3>
          <p>After 3, 5, and 7 wrong guesses, a cropped piece of the monster's artwork is revealed — getting clearer each time.</p>

          <p className="help-modal__footer">A new monster appears every day at midnight UTC.</p>
        </div>
      </div>
    </div>
  );
}

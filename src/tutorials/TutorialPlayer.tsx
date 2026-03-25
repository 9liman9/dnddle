import { Player } from '@remotion/player';
import type { GameMode } from '../types';
import { ClassicTutorial } from './ClassicTutorial';
import { ArtworkTutorial } from './ArtworkTutorial';
import { SpelldleTutorial } from './SpelldleTutorial';
import { EmojiTutorial } from './EmojiTutorial';
import './TutorialPlayer.css';

interface TutorialPlayerProps {
  mode: GameMode;
  onClose: () => void;
}

const TUTORIALS: Record<GameMode, { component: React.FC; duration: number }> = {
  classic: { component: ClassicTutorial, duration: 300 },
  artwork: { component: ArtworkTutorial, duration: 240 },
  spelldle: { component: SpelldleTutorial, duration: 240 },
  emoji: { component: EmojiTutorial, duration: 240 },
};

export function TutorialPlayer({ mode, onClose }: TutorialPlayerProps) {
  const tutorial = TUTORIALS[mode];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
        <button className="tutorial-modal__close" onClick={onClose}>\u2715</button>
        <div className="tutorial-modal__player">
          <Player
            component={tutorial.component}
            durationInFrames={tutorial.duration}
            fps={30}
            compositionWidth={800}
            compositionHeight={500}
            style={{ width: '100%', height: 'auto', borderRadius: 12 }}
            autoPlay
            loop
            controls={false}
          />
        </div>
        <button className="tutorial-modal__dismiss" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}

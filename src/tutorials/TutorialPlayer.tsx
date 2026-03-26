import { useState, useEffect } from 'react';
import type { GameMode } from '../types';
import './TutorialPlayer.css';

interface TutorialPlayerProps {
  mode: GameMode;
  onClose: () => void;
}

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

const TUTORIALS: Record<GameMode, { title: string; steps: TutorialStep[] }> = {
  classic: {
    title: 'Classic Mode',
    steps: [
      { icon: '\u{1F50D}', title: 'Search & Guess', description: 'Type a D&D monster name and select it from the dropdown to make your guess.' },
      { icon: '\u{1F7E9}', title: 'Green = Match', description: 'This attribute exactly matches the target monster.' },
      { icon: '\u{1F7E8}', title: 'Gold = Partial', description: 'You share something in common (e.g. same alignment axis, overlapping biome).' },
      { icon: '\u2B1B', title: 'Dark = Wrong', description: 'No match at all for this attribute.' },
      { icon: '\u2B06\u2B07', title: 'Arrows = Direction', description: 'For Size and CR \u2014 yellow arrows show if the answer is higher or lower.' },
      { icon: '\u{1F4DC}', title: 'Hints Unlock', description: 'After 2 guesses: lore hint. After 3: artwork preview. Keep guessing!' },
      { icon: '\u{1F3C6}', title: 'Solve It!', description: 'Get all 7 columns green to win! Share your result with friends.' },
    ],
  },
  artwork: {
    title: 'Artwork Mode',
    steps: [
      { icon: '\u{1F3A8}', title: 'Blurred Art', description: 'A piece of official D&D artwork is shown, heavily blurred.' },
      { icon: '\u{1F441}\uFE0F', title: 'Each Guess Clears', description: 'Every wrong guess reduces the blur, revealing more detail.' },
      { icon: '\u{1F4DC}', title: 'Lore Hint', description: 'A redacted lore passage is shown from the start to help you.' },
      { icon: '\u{1F409}', title: 'Name the Creature', description: 'Type your guess \u2014 can you identify the monster from its art?' },
    ],
  },
  spelldle: {
    title: "Spell'dle",
    steps: [
      { icon: '\u2728', title: 'Guess a Spell', description: 'Type a D&D spell name to guess. 557 spells from all sourcebooks!' },
      { icon: '\u{1F4CA}', title: '7 Properties', description: 'Level, School, Casting Time, Range, Components, Duration, Concentration.' },
      { icon: '\u{1F7E9}', title: 'Color Feedback', description: 'Same as Classic \u2014 green match, gold partial, dark wrong, arrows for level/range.' },
      { icon: '\u{1F3AF}', title: 'Narrow It Down', description: 'Use the clues to deduce the spell. Experienced casters have an edge!' },
    ],
  },
  emoji: {
    title: 'Emoji Mode',
    steps: [
      { icon: '\u{1F9E9}', title: 'Decode Emojis', description: 'Emoji clues represent a D&D monster \u2014 size, type, biome, movement, danger.' },
      { icon: '\u{1F4DC}', title: 'Lore Hint', description: 'A redacted lore passage is shown to help you identify the creature.' },
      { icon: '\u{1F513}', title: 'More Each Guess', description: 'Each wrong guess reveals another row of emoji clues.' },
      { icon: '\u{1F409}', title: 'Name It!', description: 'Figure out which monster the emojis represent and type its name.' },
    ],
  },
};

export function TutorialPlayer({ mode, onClose }: TutorialPlayerProps) {
  const tutorial = TUTORIALS[mode];
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % tutorial.steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [tutorial.steps.length]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
        <button className="tutorial-modal__close" onClick={onClose}>{'\u2715'}</button>

        <h2 className="tutorial-modal__title">{tutorial.title}</h2>

        <div className="tutorial-modal__steps">
          {tutorial.steps.map((step, i) => (
            <div
              key={i}
              className={`tutorial-step ${i === activeStep ? 'tutorial-step--active' : ''} ${i < activeStep ? 'tutorial-step--done' : ''}`}
              onClick={() => setActiveStep(i)}
            >
              <span className="tutorial-step__icon">{step.icon}</span>
              <div className="tutorial-step__content">
                <h3 className="tutorial-step__title">{step.title}</h3>
                <p className="tutorial-step__desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="tutorial-modal__dots">
          {tutorial.steps.map((_, i) => (
            <button
              key={i}
              className={`tutorial-dot ${i === activeStep ? 'tutorial-dot--active' : ''}`}
              onClick={() => setActiveStep(i)}
            />
          ))}
        </div>

        <button className="tutorial-modal__dismiss" onClick={onClose}>
          Got it, let me play!
        </button>
      </div>
    </div>
  );
}

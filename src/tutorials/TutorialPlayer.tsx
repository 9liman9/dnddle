import { useState, useEffect } from 'react';
import type { GameMode } from '../types';
import './TutorialPlayer.css';

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
  visual?: string;
}

const TUTORIALS: Record<GameMode, { title: string; subtitle: string; steps: TutorialStep[] }> = {
  classic: {
    title: 'Classic Mode',
    subtitle: 'Guess the D&D monster by its attributes',
    steps: [
      { icon: '🔍', title: 'Search & Guess', description: 'Type a monster name in the search bar and select from the dropdown.', visual: 'Type "Beholder" → pick from list → see feedback' },
      { icon: '🟩', title: 'Green = Exact Match', description: 'This attribute is exactly the same as the mystery monster.' },
      { icon: '🟨', title: 'Gold = Partial Match', description: 'You share something — e.g. same alignment axis, overlapping biome.' },
      { icon: '⬛', title: 'Dark = No Match', description: 'This attribute is completely different.' },
      { icon: '⬆', title: 'Yellow Arrows', description: 'For Size and CR — arrows show if the answer is higher ⬆ or lower ⬇.' },
      { icon: '📜', title: 'Hints Unlock', description: 'After 2 guesses: lore. After 3: artwork. More clues the more you guess!' },
      { icon: '🏆', title: 'Win!', description: 'All 7 columns green = victory! Share your emoji grid with friends.' },
    ],
  },
  artwork: {
    title: 'Artwork Mode',
    subtitle: 'Name the creature from its official D&D art',
    steps: [
      { icon: '🎨', title: 'Blurred Artwork', description: 'Official D&D artwork is shown, but heavily blurred.' },
      { icon: '📜', title: 'Lore Clue', description: 'A lore passage is shown with the monster name redacted (█████).' },
      { icon: '👁️', title: 'Guess to Reveal', description: 'Each wrong guess reduces the blur, showing more detail.' },
      { icon: '💡', title: 'More Hints', description: 'After 4 guesses: traits. After 6: source book. After 8: creature type.' },
      { icon: '🐉', title: 'Name It!', description: 'Type the monster name. The full art reveals when you solve it!' },
    ],
  },
  spelldle: {
    title: "Spell'dle",
    subtitle: 'Guess the D&D spell by its properties',
    steps: [
      { icon: '✨', title: 'Pick a Spell', description: 'Type a spell name. There are 557 spells from all D&D sourcebooks!' },
      { icon: '📊', title: '7 Properties', description: 'Level, School, Casting Time, Range, Components, Duration, Concentration.' },
      { icon: '🟩', title: 'Same Feedback', description: 'Green = match, Gold = partial, Dark = wrong. Arrows for Level and Range.' },
      { icon: '🎯', title: 'Deduce It', description: 'Narrow down school, level, and components to find the spell.' },
    ],
  },
  emoji: {
    title: 'Emoji Mode',
    subtitle: 'Decode emoji clues to find the monster',
    steps: [
      { icon: '📜', title: 'Read the Lore', description: 'A redacted lore passage gives your first clue about the creature.' },
      { icon: '🧩', title: 'Emoji Clues', description: 'Rows of emojis represent the monster — size, type, biome, movement, danger.' },
      { icon: '🔓', title: 'Guess for More', description: 'Each wrong guess reveals another row of emoji clues.' },
      { icon: '🐉', title: 'Name the Monster', description: 'Type your guess. No D&D knowledge needed — just decode the emojis!' },
    ],
  },
};

export function TutorialPlayer({ mode, onClose }: { mode: GameMode; onClose: () => void }) {
  const tutorial = TUTORIALS[mode];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % tutorial.steps.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [tutorial.steps.length]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
        <button className="tutorial-modal__close" onClick={onClose}>✕</button>

        <div className="tutorial-modal__header">
          <h2 className="tutorial-modal__title">{tutorial.title}</h2>
          <p className="tutorial-modal__subtitle">{tutorial.subtitle}</p>
        </div>

        <div className="tutorial-modal__steps">
          {tutorial.steps.map((step, i) => (
            <div
              key={i}
              className={`tutorial-step ${i === activeStep ? 'tutorial-step--active' : ''}`}
              onClick={() => setActiveStep(i)}
            >
              <span className="tutorial-step__icon">{step.icon}</span>
              <div className="tutorial-step__content">
                <h3 className="tutorial-step__title">{step.title}</h3>
                <p className="tutorial-step__desc">{step.description}</p>
                {step.visual && i === activeStep && (
                  <p className="tutorial-step__visual">{step.visual}</p>
                )}
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

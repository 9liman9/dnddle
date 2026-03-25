import { useState, useCallback, useEffect, useRef } from 'react'
import type { GameMode } from './types'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { GuessGrid } from './components/GuessGrid'
import { HintPanel } from './components/HintPanel'
import { ArtworkMode } from './components/ArtworkMode'
import { SpelldleMode } from './components/SpelldleMode'
import { EmojiMode } from './components/EmojiMode'
import { VictoryModal } from './components/VictoryModal'
import { StatsModal } from './components/StatsModal'
import { HelpModal } from './components/HelpModal'
import { useDailyMonster } from './hooks/useDailyMonster'
import { useGame } from './hooks/useGame'
import { useNameGuess } from './hooks/useNameGuess'
import { useLocalStats } from './hooks/useLocalStats'
import { type Difficulty, filterByDifficulty, DIFFICULTY_LABELS } from './lib/difficulty'
import { playUISound, playMonsterSound } from './lib/sounds'

function App() {
  const [mode, setMode] = useState<GameMode>('classic')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const { monsters, dailyMonster, dailyNumber, dateString, loading, error, isRandom, pickRandom, backToDaily } = useDailyMonster(mode)
  const { stats, recordWin, recordLoss } = useLocalStats()

  // Classic mode hook
  const classicGame = useGame(
    dailyMonster, monsters, dailyNumber, dateString, recordWin, isRandom,
  )

  // Non-classic monster mode hooks
  const artworkGame = useNameGuess('artwork', dailyMonster, monsters, dateString, isRandom)
  const emojiGame = useNameGuess('emoji', dailyMonster, monsters, dateString, isRandom)

  // Get current game state based on mode (spelldle manages its own state internally)
  const currentGame = mode === 'classic' ? classicGame
    : mode === 'artwork' ? artworkGame
    : mode === 'emoji' ? emojiGame
    : null // spelldle handles its own state

  const solved = currentGame?.solved ?? false
  const gameOver = currentGame?.gameOver ?? false
  const giveUp = currentGame?.giveUp ?? (() => {})

  // Sound effects: track guess count to play sounds on change
  const prevGuessCount = useRef(0)
  useEffect(() => {
    if (!currentGame) return
    const count = currentGame.guesses.length
    if (count > prevGuessCount.current) {
      if (solved) {
        playUISound('correct')
        if (dailyMonster?.soundClip) {
          setTimeout(() => playMonsterSound(dailyMonster.soundClip), 500)
        }
      } else {
        playUISound('guess')
      }
    }
    prevGuessCount.current = count
  }, [currentGame?.guesses.length, solved, dailyMonster])

  // Play wrong sound on give up
  useEffect(() => {
    if (gameOver && !solved && currentGame && currentGame.guesses.length > 0) {
      playUISound('wrong')
    }
  }, [gameOver, solved])

  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [victoryDismissed, setVictoryDismissed] = useState(false)

  // Show hero modal on solve or give up (not for spelldle — it handles its own)
  if (currentGame && gameOver && !showVictory && !victoryDismissed && currentGame.guesses.length > 0) {
    setTimeout(() => setShowVictory(true), solved ? 800 : 300)
    setVictoryDismissed(true)
  }

  const handleRandomGame = useCallback(() => {
    const pool = filterByDifficulty(monsters, difficulty)
    pickRandom(pool)
    classicGame.reset()
    artworkGame.reset()
    emojiGame.reset()
    setShowVictory(false)
    setVictoryDismissed(false)
    prevGuessCount.current = 0
  }, [pickRandom, monsters, difficulty, classicGame, artworkGame, emojiGame])

  const handleBackToDaily = useCallback(() => {
    backToDaily()
    classicGame.reset()
    artworkGame.reset()
    emojiGame.reset()
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [backToDaily, classicGame, artworkGame, emojiGame])

  const handleModeChange = useCallback((newMode: GameMode) => {
    setMode(newMode)
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [])

  const handleGiveUp = useCallback(() => {
    giveUp()
    if (!isRandom) recordLoss(dateString)
  }, [giveUp, isRandom, recordLoss, dateString])

  if (loading && mode !== 'spelldle') {
    return (
      <div className="app">
        <div className="loading">Loading the bestiary...</div>
      </div>
    )
  }

  if (error && mode !== 'spelldle') {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        streak={stats.currentStreak}
        totalWins={stats.gamesWon}
        onStatsClick={() => setShowStats(true)}
        onHelpClick={() => setShowHelp(true)}
      />

      {/* Mode bar — not shown for spelldle (it manages its own) */}
      {mode !== 'spelldle' && (
        <div className="mode-bar">
          <div className="mode-bar__top">
            <span className="mode-bar__label">
              {isRandom ? '🎲 Random Mode' : `📅 Daily #${dailyNumber}`}
            </span>
            {isRandom && (
              <div className="difficulty-selector">
                {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    className={`difficulty-btn ${difficulty === d ? 'difficulty-btn--active' : ''}`}
                    onClick={() => setDifficulty(d)}
                    title={DIFFICULTY_LABELS[d].desc}
                  >
                    {DIFFICULTY_LABELS[d].label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mode-bar__actions">
            {!isRandom && (
              <button className="mode-bar__btn" onClick={handleRandomGame}>
                🎲 Random
              </button>
            )}
            {isRandom && (
              <>
                <button className="mode-bar__btn" onClick={handleRandomGame}>
                  🎲 New Random
                </button>
                <button className="mode-bar__btn mode-bar__btn--daily" onClick={handleBackToDaily}>
                  📅 Daily
                </button>
              </>
            )}
            {currentGame && !gameOver && currentGame.guesses.length >= 1 && (
              <button className="mode-bar__btn mode-bar__btn--giveup" onClick={handleGiveUp}>
                🏳 Give Up
              </button>
            )}
            {currentGame && gameOver && (
              <button className="mode-bar__btn mode-bar__btn--play" onClick={handleRandomGame}>
                ⚔ Play Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Classic mode */}
      {mode === 'classic' && dailyMonster && (
        <div className="game-layout">
          <aside className="game-layout__left">
            <HintPanel
              guessCount={classicGame.guesses.length}
              tokenUrl={dailyMonster.tokenUrl}
              artworkUrl={dailyMonster.artworkUrl}
              solved={classicGame.solved}
              monsterName={dailyMonster.name}
              sourceFull={dailyMonster.sourceFull}
              source={dailyMonster.source}
              lore={dailyMonster.lore}
              traits={dailyMonster.traits}
              size={dailyMonster.size}
              type={dailyMonster.type}
              cr={dailyMonster.cr}
              alignment={dailyMonster.alignment}
              biomes={dailyMonster.biomes}
              movement={dailyMonster.movement}
              senses={dailyMonster.senses}
            />
          </aside>
          <main className="game-layout__right">
            <SearchBar
              monsters={monsters}
              guessedIds={classicGame.guessedIds}
              onGuess={classicGame.submitGuess}
              disabled={classicGame.gameOver}
            />
            <GuessGrid guesses={classicGame.guesses} />
            {classicGame.gameOver && !classicGame.solved && (
              <div className="game-over">
                <p>The creature was <strong>{dailyMonster.name}</strong></p>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Artwork mode */}
      {mode === 'artwork' && dailyMonster && (
        <ArtworkMode
          monster={dailyMonster}
          monsters={monsters}
          guesses={artworkGame.guesses}
          guessedIds={artworkGame.guessedIds}
          solved={artworkGame.solved}
          gameOver={artworkGame.gameOver}
          onGuess={artworkGame.submitGuess}
        />
      )}

      {/* Spell-dle mode */}
      {mode === 'spelldle' && (
        <SpelldleMode
          dateString={dateString}
          isRandom={isRandom}
          onPickRandom={handleRandomGame}
        />
      )}

      {/* Emoji mode */}
      {mode === 'emoji' && dailyMonster && (
        <EmojiMode
          monster={dailyMonster}
          monsters={monsters}
          guesses={emojiGame.guesses}
          guessedIds={emojiGame.guessedIds}
          solved={emojiGame.solved}
          gameOver={emojiGame.gameOver}
          onGuess={emojiGame.submitGuess}
        />
      )}

      <div className="ornament">— ✦ ◆ ✦ —</div>

      {/* Victory modal — for monster modes only */}
      {showVictory && dailyMonster && currentGame && (
        <VictoryModal
          monster={dailyMonster}
          guesses={mode === 'classic' ? classicGame.guesses : []}
          guessCount={currentGame.guesses.length}
          dailyNumber={dailyNumber}
          solved={solved}
          mode={mode}
          onClose={() => setShowVictory(false)}
          onPlayAgain={() => { setShowVictory(false); handleRandomGame(); }}
        />
      )}

      {showStats && (
        <StatsModal
          stats={stats}
          monsters={monsters}
          onClose={() => setShowStats(false)}
        />
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}

export default App

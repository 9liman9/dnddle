import { useState, useCallback } from 'react'
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

function App() {
  const [mode, setMode] = useState<GameMode>('classic')
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
    pickRandom()
    classicGame.reset()
    artworkGame.reset()
    emojiGame.reset()
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [pickRandom, classicGame, artworkGame, emojiGame])

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
          <span className="mode-bar__label">
            {isRandom ? '🎲 Random Mode' : `📅 Daily #${dailyNumber}`}
          </span>
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

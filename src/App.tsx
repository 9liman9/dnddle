import { useState, useCallback } from 'react'
import type { GameMode } from './types'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { GuessGrid } from './components/GuessGrid'
import { HintPanel } from './components/HintPanel'
import { ArtworkMode } from './components/ArtworkMode'
import { StatBlockMode } from './components/StatBlockMode'
import { LoreMode } from './components/LoreMode'
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

  // Non-classic mode hooks
  const artworkGame = useNameGuess('artwork', dailyMonster, monsters, dateString, isRandom)
  const statBlockGame = useNameGuess('stat-block', dailyMonster, monsters, dateString, isRandom)
  const loreGame = useNameGuess('lore', dailyMonster, monsters, dateString, isRandom)

  // Get current game state based on mode
  const currentGame = mode === 'classic' ? classicGame
    : mode === 'artwork' ? artworkGame
    : mode === 'stat-block' ? statBlockGame
    : loreGame

  const { solved, gameOver, giveUp } = currentGame

  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [victoryDismissed, setVictoryDismissed] = useState(false)

  // Show hero modal on solve or give up
  if (gameOver && !showVictory && !victoryDismissed && currentGame.guesses.length > 0) {
    setTimeout(() => setShowVictory(true), solved ? 800 : 300)
    setVictoryDismissed(true)
  }

  const handleRandomGame = useCallback(() => {
    pickRandom()
    classicGame.reset()
    artworkGame.reset()
    statBlockGame.reset()
    loreGame.reset()
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [pickRandom, classicGame, artworkGame, statBlockGame, loreGame])

  const handleBackToDaily = useCallback(() => {
    backToDaily()
    classicGame.reset()
    artworkGame.reset()
    statBlockGame.reset()
    loreGame.reset()
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [backToDaily, classicGame, artworkGame, statBlockGame, loreGame])

  const handleModeChange = useCallback((newMode: GameMode) => {
    setMode(newMode)
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [])

  const handleGiveUp = useCallback(() => {
    giveUp()
    if (!isRandom) recordLoss(dateString)
  }, [giveUp, isRandom, recordLoss, dateString])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading the bestiary...</div>
      </div>
    )
  }

  if (error) {
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

      {/* Mode bar */}
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
          {!gameOver && currentGame.guesses.length >= 1 && (
            <button className="mode-bar__btn mode-bar__btn--giveup" onClick={handleGiveUp}>
              🏳 Give Up
            </button>
          )}
          {gameOver && (
            <button className="mode-bar__btn mode-bar__btn--play" onClick={handleRandomGame}>
              ⚔ Play Again
            </button>
          )}
        </div>
      </div>

      {/* Game content based on mode */}
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

      {mode === 'stat-block' && dailyMonster && (
        <StatBlockMode
          monster={dailyMonster}
          monsters={monsters}
          guesses={statBlockGame.guesses}
          guessedIds={statBlockGame.guessedIds}
          solved={statBlockGame.solved}
          gameOver={statBlockGame.gameOver}
          onGuess={statBlockGame.submitGuess}
        />
      )}

      {mode === 'lore' && dailyMonster && (
        <LoreMode
          monster={dailyMonster}
          monsters={monsters}
          guesses={loreGame.guesses}
          guessedIds={loreGame.guessedIds}
          solved={loreGame.solved}
          gameOver={loreGame.gameOver}
          onGuess={loreGame.submitGuess}
        />
      )}

      <div className="ornament">— ✦ ◆ ✦ —</div>

      {showVictory && dailyMonster && (
        <VictoryModal
          monster={dailyMonster}
          guesses={mode === 'classic' ? classicGame.guesses : []}
          dailyNumber={dailyNumber}
          solved={solved}
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

import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { GuessGrid } from './components/GuessGrid'
import { HintPanel } from './components/HintPanel'
import { VictoryModal } from './components/VictoryModal'
import { StatsModal } from './components/StatsModal'
import { HelpModal } from './components/HelpModal'
import { useDailyMonster } from './hooks/useDailyMonster'
import { useGame } from './hooks/useGame'
import { useLocalStats } from './hooks/useLocalStats'

function App() {
  const { monsters, dailyMonster, dailyNumber, dateString, loading, error, isRandom, pickRandom, backToDaily } = useDailyMonster()
  const { stats, recordWin, recordLoss } = useLocalStats()
  const { guesses, solved, guessedIds, submitGuess, giveUp, reset, gameOver } = useGame(
    dailyMonster,
    monsters,
    dailyNumber,
    dateString,
    recordWin,
    isRandom,
  )

  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showVictory, setShowVictory] = useState(false)
  const [victoryDismissed, setVictoryDismissed] = useState(false)

  // Show hero modal on solve or give up
  if ((solved || gameOver) && !showVictory && !victoryDismissed && guesses.length > 0) {
    setTimeout(() => setShowVictory(true), solved ? 800 : 300)
    setVictoryDismissed(true)
  }

  const handleRandomGame = useCallback(() => {
    pickRandom()
    reset()
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [pickRandom, reset])

  const handleBackToDaily = useCallback(() => {
    backToDaily()
    reset()
    setShowVictory(false)
    setVictoryDismissed(false)
  }, [backToDaily, reset])

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
              🎲 Random Monster
            </button>
          )}
          {isRandom && (
            <>
              <button className="mode-bar__btn" onClick={handleRandomGame}>
                🎲 New Random
              </button>
              <button className="mode-bar__btn mode-bar__btn--daily" onClick={handleBackToDaily}>
                📅 Back to Daily
              </button>
            </>
          )}
          {!gameOver && guesses.length >= 1 && (
            <button className="mode-bar__btn mode-bar__btn--giveup" onClick={() => { giveUp(); if (!isRandom) recordLoss(dateString); }}>
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

      {/* Two-column layout: hints left, gameplay right */}
      <div className="game-layout">
        <aside className="game-layout__left">
          <HintPanel
            guessCount={guesses.length}
            tokenUrl={dailyMonster?.tokenUrl}
            artworkUrl={dailyMonster?.artworkUrl}
            solved={solved}
            monsterName={dailyMonster?.name}
            sourceFull={dailyMonster?.sourceFull}
            source={dailyMonster?.source}
            lore={dailyMonster?.lore}
            traits={dailyMonster?.traits}
            size={dailyMonster?.size}
            type={dailyMonster?.type}
            cr={dailyMonster?.cr}
            alignment={dailyMonster?.alignment}
            biomes={dailyMonster?.biomes}
            movement={dailyMonster?.movement}
            senses={dailyMonster?.senses}
          />
        </aside>

        <main className="game-layout__right">
          <SearchBar
            monsters={monsters}
            guessedIds={guessedIds}
            onGuess={submitGuess}
            disabled={gameOver}
          />

          <GuessGrid guesses={guesses} />

          {gameOver && !solved && (
            <div className="game-over">
              <p>The creature was <strong>{dailyMonster?.name}</strong></p>
            </div>
          )}

        </main>
      </div>

      <div className="ornament">— ✦ ◆ ✦ —</div>

      {showVictory && dailyMonster && (
        <VictoryModal
          monster={dailyMonster}
          guesses={guesses}
          dailyNumber={dailyNumber}
          solved={solved}
          onClose={() => { setShowVictory(false) }}
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

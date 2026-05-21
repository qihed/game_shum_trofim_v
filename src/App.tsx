import './App.css'
import { StatsPanel } from './components/StatsPanel'
import { story } from './game/story'
import { useGameState } from './game/useGameState'
import { BlockScreen } from './screens/BlockScreen'
import { FinalScreen } from './screens/FinalScreen'
import { PassportScreen } from './screens/PassportScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'

function App() {
  const game = useGameState()

  return (
    <div className="app">
      <header className="appHeader">
        <div className="brand">
          <div className="clap" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="brandText">
            <div className="brandTitle">{story.meta.title}</div>
            <div className="brandSub">{story.meta.subtitle}</div>
          </div>
        </div>
        <div className="headerActions">
          <button type="button" className="linkBtn" onClick={game.actions.restart}>
            Сбросить прогресс
          </button>
        </div>
      </header>

      <main className="main">
        <div className="content">
          {game.phase === 'welcome' && (
            <WelcomeScreen onNext={game.actions.toPassport} />
          )}
          {game.phase === 'passport' && (
            <PassportScreen onNext={game.actions.startStory} />
          )}
          {game.phase === 'block' && game.currentBlock && (
            <BlockScreen block={game.currentBlock} onChoose={game.actions.chooseInBlock} />
          )}
          {game.phase === 'final' && <FinalScreen onChoose={game.actions.chooseFinal} />}
          {game.phase === 'summary' && (
            <SummaryScreen stats={game.stats} history={game.history} onRestart={game.actions.restart} />
          )}
        </div>

        <StatsPanel stats={game.stats} lastDelta={game.lastDelta} />
      </main>
    </div>
  )
}

export default App

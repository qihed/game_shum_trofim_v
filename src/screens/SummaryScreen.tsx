import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { buildEpilogue } from '../game/epilogue'
import { story } from '../game/story'
import type { GameHistoryEntry, StatKey, Stats } from '../game/types'

const statLabels: Record<StatKey, string> = {
  talent: 'Талант',
  craft: 'Ремесло',
  watching: 'Насмотренность',
  teamTrust: 'Доверие команды',
  audienceContact: 'Контакт со зрителем',
  projectViability: 'Жизнеспособность',
  staminaEnergy: 'Выносливость',
}

export function SummaryScreen({
  stats,
  history,
  onRestart,
}: {
  stats: Stats
  history: GameHistoryEntry[]
  onRestart: () => void
}) {
  const epilogue = buildEpilogue(stats, history)
  const finalEntry = history.findLast((h) => h.kind === 'final') as
    | { kind: 'final'; choiceId: string }
    | undefined
  const finalChoice = finalEntry
    ? story.final?.choices.find((c) => c.id === finalEntry.choiceId) ?? null
    : null

  return (
    <div className="screen">
      <Card className="epilogueCard">
        <h1 className="title">Итог вашей истории</h1>
        <p className="lead epilogueIntro">{epilogue.intro}</p>

        {finalChoice && (
          <div className="epilogueFinalePick">
            <div className="sectionLabel">Финальная развилка</div>
            <div className="pickLine">
              <span className="pickId">{finalChoice.id}</span>
              <span className="pickLabel">{finalChoice.label}</span>
            </div>
          </div>
        )}

        <div className="epilogueSections">
          {epilogue.sections.map((section) => (
            <article key={section.title} className="epilogueSection">
              <h2 className="epilogueSectionTitle">{section.title}</h2>
              <div className="epilogueSectionBody prewrap">{section.body}</div>
            </article>
          ))}
        </div>

        <div className="blockSection epilogueStats">
          <div className="sectionLabel">Финальные показатели</div>
          <p className="epilogueStatsHint">
            Они не «оценка в школе», а срез того, как вы вели проект: ремесло, команду,
            контакт со зрителем, выносливость.
          </p>
          <div className="statsSummary">
            {Object.entries(stats).map(([k, v]) => (
              <div className="statsSummaryItem" key={k}>
                <div className="statsSummaryKey">{statLabels[k as StatKey] ?? k}</div>
                <div className="statsSummaryVal">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <details className="history">
          <summary>Показать все выборы по шагам</summary>
          <ol>
            {history.map((h, idx) => {
              if (h.kind === 'final') {
                return <li key={idx}>Финал: {h.choiceId}</li>
              }
              const block = story.blocks.find((b) => b.id === h.blockId)
              const choice = block?.choices.find((c) => c.id === h.choiceId)
              return (
                <li key={idx}>
                  {block?.title ?? `Блок ${h.blockId}`}: {choice?.label ?? h.choiceId}
                </li>
              )
            })}
          </ol>
        </details>

        <p className="epilogueClosing">
          Думай, думай, думай — и если захотите, пройдите путь иначе. Другой порядок
          ответов соберёт другую жизнь того же фильма.
        </p>

        <div className="actions">
          <Button onClick={onRestart}>Начать заново</Button>
        </div>
      </Card>
    </div>
  )
}

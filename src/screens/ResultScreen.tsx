import { Button } from '../components/Button'
import { Card } from '../components/Card'
import type { Block, Choice, StatKey } from '../game/types'

const statLabels: Record<StatKey, string> = {
  talent: 'Талант',
  craft: 'Ремесло',
  watching: 'Насмотренность',
  teamTrust: 'Доверие команды',
  audienceContact: 'Контакт со зрителем',
  projectViability: 'Жизнеспособность',
  staminaEnergy: 'Выносливость',
}

export function ResultScreen({
  block,
  choice,
  onNext,
}: {
  block: Block
  choice: Choice
  onNext: () => void
}) {
  const effects = Object.entries(choice.deltaStats ?? {}).filter(([, v]) => (v ?? 0) !== 0)
  return (
    <div className="screen">
      <Card>
        <div className="blockTop">
          <div className="blockNo">Блок {block.id}</div>
          <div className="blockTitle">{block.title}</div>
        </div>

        <div className="resultPick">
          <div className="sectionLabel">Ваш выбор</div>
          <div className="pickLine">
            <span className="pickId">{choice.id}</span>
            <span className="pickLabel">{choice.label}</span>
          </div>
        </div>

        <div className="blockSection">
          <div className="sectionLabel">Последствие</div>
          <div className="sectionBody prewrap">{choice.consequence}</div>
        </div>

        <div className="blockSection">
          <div className="sectionLabel">Анализ выбора</div>
          <div className="sectionBody prewrap">{choice.analysis}</div>
        </div>

        {effects.length > 0 && (
          <div className="blockSection">
            <div className="sectionLabel">Изменения показателей</div>
            <div className="effects">
              {effects.map(([k, v]) => (
                <span key={k} className={`effect ${Number(v) > 0 ? 'plus' : 'minus'}`}>
                  {statLabels[k as StatKey] ?? k} {Number(v) > 0 ? `+${v}` : v}
                </span>
              ))}
            </div>
          </div>
        )}

        {choice.reflectionQuestion && (
          <div className="reflection">
            <div className="sectionLabel">Вопрос на размышление</div>
            <div className="reflectionQ">{choice.reflectionQuestion}</div>
          </div>
        )}

        <div className="actions">
          <Button onClick={onNext}>Дальше</Button>
        </div>
      </Card>
    </div>
  )
}


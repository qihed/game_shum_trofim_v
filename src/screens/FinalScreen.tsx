import { Card } from '../components/Card'
import { story } from '../game/story'

export function FinalScreen({ onChoose }: { onChoose: (choiceId: string) => void }) {
  const final = story.final
  if (!final) return null

  return (
    <div className="screen">
      <Card>
        <div className="blockTop">
          <div className="blockNo">Финал</div>
          <div className="blockTitle">Финальная развилка</div>
        </div>

        <div className="blockSection">
          <div className="sectionLabel">Ситуация</div>
          <div className="sectionBody prewrap">{final.situation}</div>
          <div className="thinkInline">Думай, думай, думай....</div>
        </div>

        <div className="choices">
          {final.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="choice"
              onClick={() => onChoose(c.id)}
            >
              <div className="choiceId">{c.id}</div>
              <div className="choiceBody">
                <div className="choiceLabel">{c.label}</div>
                <div className="choiceText">{c.text}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}


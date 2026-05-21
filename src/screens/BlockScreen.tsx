import { Card } from '../components/Card'
import type { Block } from '../game/types'

export function BlockScreen({
  block,
  onChoose,
}: {
  block: Block
  onChoose: (choiceId: string) => void
}) {
  return (
    <div className="screen">
      <Card>
        <div className="blockTop">
          <div className="blockNo">Блок {block.id}</div>
          <div className="blockTitle">{block.title}</div>
        </div>

        <div className="blockSection">
          <div className="sectionLabel">Вопрос</div>
          <div className="sectionBody">{block.question}</div>
        </div>

        <div className="blockSection">
          <div className="sectionLabel">Ситуация</div>
          <div className="sectionBody prewrap">{block.situation}</div>
          <div className="thinkInline">Думай, думай, думай....</div>
        </div>

        <div className="choices">
          {block.choices.map((c) => (
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


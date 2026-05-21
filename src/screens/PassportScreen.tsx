import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { story } from '../game/story'

const profileLabels: Record<string, string> = {
  name: 'Имя',
  age: 'Возраст',
  dream: 'Мечта',
  education: 'Образование',
  experience: 'Опыт',
  family: 'Семья',
  allies: 'Единомышленники',
  socialCapital: 'Социальный капитал и связи',
  financialCapital: 'Финансовый капитал',
  character: 'Характер',
  topGoal: 'Топ цель',
}

export function PassportScreen({ onNext }: { onNext: () => void }) {
  const p = story.heroProfile
  return (
    <div className="screen">
      <Card>
        <div className="passportHeader">
          <div className="passportChip">ПРОПУСК</div>
          <div className="passportTitle">Карточка-пропуск</div>
        </div>

        <div className="passportGrid">
          <div className="passportPhoto" aria-hidden="true">
            <div className="photoStub">Фото</div>
          </div>
          <div className="passportMeta">
            <div className="kv">
              <span className="k">Имя</span>
              <span className="v">{String(p.name)}</span>
            </div>
            <div className="kv">
              <span className="k">Возраст</span>
              <span className="v">{String(p.age)}</span>
            </div>
            <div className="kv">
              <span className="k">Мечта</span>
              <span className="v">{String(p.dream)}</span>
            </div>
            <div className="kv">
              <span className="k">Образование</span>
              <span className="v">{String(p.education)}</span>
            </div>
            <div className="kv">
              <span className="k">Опыт</span>
              <span className="v">{String(p.experience)}</span>
            </div>
          </div>
        </div>

        <details className="passportMore">
          <summary>Показать полный профиль</summary>
          <div className="passportMoreBody">
            {Object.entries(p)
              .filter(([k]) => !['name', 'age', 'dream', 'education', 'experience'].includes(k))
              .map(([k, v]) => (
                <div className="kv" key={k}>
                  <span className="k">{profileLabels[k] ?? k}</span>
                  <span className="v">{String(v)}</span>
                </div>
              ))}
          </div>
        </details>

        <div className="actions">
          <Button onClick={onNext}>Дальше</Button>
        </div>
      </Card>
    </div>
  )
}


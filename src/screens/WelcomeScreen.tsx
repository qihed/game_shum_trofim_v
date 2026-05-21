import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { story } from '../game/story'

export function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="screen">
      <Card>
        <h1 className="title">{story.meta.title}</h1>
        <p className="subtitle">{story.meta.subtitle}</p>
        <div className="divider" />
        <h2>{story.welcome.headline}</h2>
        <p className="lead">{story.welcome.body}</p>
        <div className="actions">
          <Button onClick={onNext}>Начать</Button>
        </div>
      </Card>
    </div>
  )
}


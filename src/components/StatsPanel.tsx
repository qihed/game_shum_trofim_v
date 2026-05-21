import type { StatKey, Stats } from '../game/types'

const labels: Record<StatKey, string> = {
  talent: 'Талант',
  craft: 'Ремесло',
  watching: 'Насмотренность',
  teamTrust: 'Доверие команды',
  audienceContact: 'Контакт со зрителем',
  projectViability: 'Жизнеспособность',
  staminaEnergy: 'Выносливость',
}

export function StatsPanel({
  stats,
  lastDelta,
}: {
  stats: Stats
  lastDelta: Partial<Stats> | null
}) {
  return (
    <aside className="statsPanel" aria-label="Показатели">
      {Object.entries(labels).map(([key, label]) => {
        const k = key as StatKey
        const value = stats[k] ?? 0
        const delta = (lastDelta?.[k] ?? 0) as number
        return (
          <div className={`statRow ${delta !== 0 ? 'changed' : ''}`} key={k}>
            <div className="statTop">
              <span className="statLabel">{label}</span>
              <span className="statValue">
                {value}
                {delta !== 0 && (
                  <span className={`statDelta ${delta > 0 ? 'plus' : 'minus'}`}>
                    {delta > 0 ? ` +${delta}` : ` ${delta}`}
                  </span>
                )}
              </span>
            </div>
            <div className="statBar" aria-hidden="true">
              <div className="statFill" style={{ width: `${(value / 10) * 100}%` }} />
            </div>
          </div>
        )
      })}
    </aside>
  )
}


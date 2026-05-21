import { Card } from './Card';
import { Badge } from './Badge';

export interface Stat {
  name: string;
  value: number;
  change?: number;
}

interface StatsPanelProps {
  stats: Stat[];
  className?: string;
}

export function StatsPanel({ stats, className = '' }: StatsPanelProps) {
  return (
    <Card className={`${className}`}>
      <h3 className="mb-6 text-primary uppercase tracking-wider text-sm">Показатели</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{stat.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm tabular-nums text-foreground">{stat.value}/10</span>
                {stat.change !== undefined && stat.change !== 0 && (
                  <Badge variant={stat.change > 0 ? 'success' : 'negative'} className="text-xs px-2">
                    {stat.change > 0 ? '+' : ''}{stat.change}
                  </Badge>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(stat.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

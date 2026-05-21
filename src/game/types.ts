export type StatKey =
  | 'talent'
  | 'craft'
  | 'watching'
  | 'teamTrust'
  | 'audienceContact'
  | 'projectViability'
  | 'staminaEnergy'

export type Stats = Record<StatKey, number>

export type Choice = {
  id: string
  label: string
  text: string
  consequence: string
  analysis: string
  reflectionQuestion: string
  deltaStats: Partial<Stats>
}

export type Block = {
  id: number
  title: string
  question: string
  situation: string
  choices: Choice[]
}

export type FinalBlock = {
  id: 'final'
  title: string
  question: string
  situation: string
  choices: Choice[]
}

export type StoryData = {
  meta: {
    title: string
    subtitle: string
    sourcePdf: string
    stats: StatKey[]
  }
  welcome: { headline: string; body: string }
  heroProfile: Record<string, string | number>
  initialStats: Stats
  blocks: Block[]
  final: FinalBlock | null
}

export type GameHistoryEntry =
  | { kind: 'block'; blockId: number; choiceId: string }
  | { kind: 'final'; choiceId: string }

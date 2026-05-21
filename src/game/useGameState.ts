import { useEffect, useMemo, useState } from 'react'
import { story } from './story'
import type { Block, Choice, GameHistoryEntry, StatKey, Stats } from './types'

type Phase = 'welcome' | 'passport' | 'block' | 'result' | 'final' | 'summary'

type PersistedState = {
  v: 1
  phase: Phase
  blockIndex: number
  stats: Stats
  history: GameHistoryEntry[]
  lastBlockId: number | null
  lastChoiceId: string | null
  lastDelta: Partial<Stats> | null
}

const STORAGE_KEY = 'ne_finalny_dubl_v2'

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

const applyDelta = (base: Stats, delta: Partial<Stats>): Stats => {
  const next = { ...base }
  for (const [k, v] of Object.entries(delta) as Array<[StatKey, number]>) {
    next[k] = clamp((next[k] ?? 0) + (v ?? 0), 0, 10)
  }
  return next
}

const emptyDelta = (): Partial<Stats> => ({})

export function useGameState() {
  const initial: PersistedState = useMemo(
    () => ({
      v: 1,
      phase: 'welcome',
      blockIndex: 0,
      stats: story.initialStats,
      history: [],
      lastBlockId: null,
      lastChoiceId: null,
      lastDelta: null,
    }),
    [],
  )

  const [state, setState] = useState<PersistedState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return initial
      const parsed = JSON.parse(raw) as PersistedState
      if (parsed?.v !== 1) return initial
      return parsed
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const currentBlock: Block | null =
    state.phase === 'block' ? story.blocks[state.blockIndex] ?? null : null

  const lastChoice: Choice | null = useMemo(() => {
    if (!currentBlock || !state.lastChoiceId) return null
    return currentBlock.choices.find((c) => c.id === state.lastChoiceId) ?? null
  }, [currentBlock, state.lastChoiceId])

  const actions = useMemo(() => {
    return {
      restart: () => {
        setState(initial)
      },
      toPassport: () => setState((s) => ({ ...s, phase: 'passport' })),
      startStory: () =>
        setState((s) => ({
          ...s,
          phase: 'block',
          blockIndex: 0,
          stats: story.initialStats,
          history: [],
          lastChoiceId: null,
          lastBlockId: null,
          lastDelta: null,
        })),
      chooseInBlock: (choiceId: string) => {
        setState((s) => {
          const block = story.blocks[s.blockIndex]
          const choice = block?.choices.find((c) => c.id === choiceId)
          if (!block || !choice) return s

          const delta = choice.deltaStats ?? emptyDelta()
          const nextIndex = s.blockIndex + 1
          const nextPhase =
            nextIndex >= story.blocks.length
              ? story.final
                ? 'final'
                : 'summary'
              : 'block'

          return {
            ...s,
            phase: nextPhase,
            blockIndex: nextPhase === 'block' ? nextIndex : s.blockIndex,
            stats: applyDelta(s.stats, delta),
            history: [...s.history, { kind: 'block', blockId: block.id, choiceId }],
            lastBlockId: block.id,
            lastChoiceId: choiceId,
            lastDelta: delta,
          }
        })
      },
      chooseFinal: (choiceId: string) => {
        setState((s) => ({
          ...s,
          phase: 'summary',
          history: [...s.history, { kind: 'final', choiceId }],
          lastChoiceId: choiceId,
          lastDelta: null,
        }))
      },
    }
  }, [initial])

  return {
    phase: state.phase,
    blockIndex: state.blockIndex,
    stats: state.stats,
    history: state.history,
    lastDelta: state.lastDelta,
    currentBlock,
    lastChoice,
    actions,
  }
}


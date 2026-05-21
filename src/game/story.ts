import storyJson from './story.json'
import type { StoryData } from './types'

export const story = storyJson as StoryData

export function getBlockIndexById(blockId: number): number {
  return story.blocks.findIndex((b) => b.id === blockId)
}


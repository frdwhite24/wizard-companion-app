import type { GameConfig } from '$lib/types/gameConfig'
import { DEFAULT_GAME_CONFIG } from '$lib/types/gameConfig'

export interface Round {
  guesses: Record<string, number>
  tricks: Record<string, number>
  scores: Record<string, number>
}

export type GameState = {
  players: string[]
  totalRounds: number
  currentRound: number
  rounds: Round[]
  stage: 'guess' | 'play' | 'result' | 'scoreboard'
  lastUpdated: number
  config: GameConfig
}

const STORAGE_KEY = 'gameState'

export function getGameState(): GameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const state = JSON.parse(stored)
    return {
      ...state,
      config: {
        ...DEFAULT_GAME_CONFIG,
        ...state.config,
      },
    }
  } catch (e) {
    console.error('Failed to parse game state:', e)
    return null
  }
}

export function setGameState(state: GameState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        lastUpdated: Date.now(),
      }),
    )
  } catch (e) {
    console.error('Failed to save game state:', e)
  }
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

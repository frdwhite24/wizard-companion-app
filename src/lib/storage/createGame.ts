import type { GameConfig } from '$lib/types/gameConfig'
import { DEFAULT_GAME_CONFIG } from '$lib/types/gameConfig'

export type CreateGameStage = 'players' | 'seating' | 'config' | 'confirm'

export interface CreateGameState {
  step: number
  players: string[]
  lastUpdated: number
  config: GameConfig
}

export function getCreateGameState(): CreateGameState | null {
  const stored = localStorage.getItem('createGame')
  if (!stored) return null

  try {
    const state = JSON.parse(stored)
    return {
      ...state,
      config: {
        ...DEFAULT_GAME_CONFIG,
        ...state.config,
      },
    }
  } catch {
    return null
  }
}

export function setCreateGameState(state: CreateGameState | null): void {
  if (state === null) {
    localStorage.removeItem('createGame')
  } else {
    localStorage.setItem('createGame', JSON.stringify(state))
  }
}

export function clearCreateGameState(): void {
  localStorage.removeItem('createGame')
}

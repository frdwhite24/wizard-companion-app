export interface CreateGameState {
  step: number
  players: string[]
  lastUpdated: number
}

const STORAGE_KEY = 'createGameState'

export function getCreateGameState(): CreateGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (e) {
    console.error('Failed to parse create game state:', e)
    return null
  }
}

export function setCreateGameState(state: CreateGameState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        lastUpdated: Date.now(),
      }),
    )
  } catch (e) {
    console.error('Failed to save create game state:', e)
  }
}

export function clearCreateGameState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

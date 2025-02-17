export type CreateGameStage = 'players' | 'seating'

export interface CreateGameState {
  step: number
  players: string[]
  lastUpdated: number
}

export function getCreateGameState(): CreateGameState | null {
  const stored = localStorage.getItem('createGame')
  if (!stored) return null

  try {
    return JSON.parse(stored)
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

import type { GameConfig } from '$lib/types/gameConfig'
import { DEFAULT_GAME_CONFIG } from '$lib/types/gameConfig'

const GAME_CONFIG_KEY = 'gameConfig'

export function getUserGameConfig(): GameConfig {
  const stored = localStorage.getItem(GAME_CONFIG_KEY)
  if (!stored) return DEFAULT_GAME_CONFIG

  try {
    const config = JSON.parse(stored)
    return {
      ...DEFAULT_GAME_CONFIG, // Ensure future config options have defaults
      ...config,
    }
  } catch {
    return DEFAULT_GAME_CONFIG
  }
}

export function setUserGameConfig(config: GameConfig): void {
  localStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config))
}

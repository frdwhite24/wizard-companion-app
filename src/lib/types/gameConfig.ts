export interface GameConfig {
  guessRestrictionEnabled: boolean
  // Future config options can be added here
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  guessRestrictionEnabled: true,
}

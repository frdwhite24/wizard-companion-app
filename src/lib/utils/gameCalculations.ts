export function calculateRounds(playerCount: number): number {
  if (playerCount < 3 || playerCount > 6) {
    throw new Error('Invalid player count')
  }
  return 60 / playerCount
}

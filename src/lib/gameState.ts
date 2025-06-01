export interface GameState {
  players: string[]
  currentRound: number
  totalRounds: number
  stage: 'guess' | 'play' | 'result' | 'scoreboard'
  rounds: Array<{
    guesses: Record<string, number>
    tricks: Record<string, number>
    scores: Record<string, number>
  }>
  completed?: boolean
}

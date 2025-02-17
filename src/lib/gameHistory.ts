import type { GameState } from './gameState'

export interface GameSummary {
  id: string // Unique identifier for the game
  date: string // ISO string of when game finished
  players: string[] // List of players
  rounds: number // Number of rounds played
  scores: {
    // Final scores
    player: string
    score: number
    correctGuesses: number
  }[]
}

export function saveGameToHistory(game: GameState): void {
  const gameHistory = loadGameHistory()

  // Calculate cumulative scores for all rounds
  const scores = game.players.map((player) => {
    const totalScore = game.rounds.reduce((total, round) => {
      const roundScore = round.scores[player] ?? 0
      return total + roundScore
    }, 0)

    const correctGuesses = game.rounds.filter(
      (round) => round.guesses[player] === round.tricks[player],
    ).length

    return {
      player,
      score: totalScore,
      correctGuesses,
    }
  })

  const summary: GameSummary = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    players: game.players,
    rounds: game.currentRound,
    scores,
  }

  gameHistory.push(summary)
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory))
}

export function loadGameHistory(): GameSummary[] {
  const stored = localStorage.getItem('gameHistory')
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

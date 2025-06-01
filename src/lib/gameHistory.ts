import type { GameState } from './gameState'

export interface RoundScore {
  player: string
  score: number
  correctGuess: boolean
}

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
  // Optional round-by-round data for new games
  roundScores?: {
    round: number
    scores: RoundScore[]
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

  // Create round-by-round data for new games
  const roundScores = game.rounds.map((round, index) => ({
    round: index + 1,
    scores: game.players.map((player) => ({
      player,
      score: round.scores[player] ?? 0,
      correctGuess: round.guesses[player] === round.tricks[player],
    })),
  }))

  const summary: GameSummary = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    players: game.players,
    rounds: game.currentRound,
    scores,
    roundScores,
  }

  gameHistory.push(summary)
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory))
}

export function loadGameHistory(): GameSummary[] {
  const stored = localStorage.getItem('gameHistory')
  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

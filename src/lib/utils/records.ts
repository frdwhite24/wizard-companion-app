import type { GameSummary } from '../gameHistory'

export interface GameRecord {
  player: string
  value: number
  date?: Date | null
  round?: number
}

export interface GameRecords {
  highestScore: GameRecord
  lowestScore: GameRecord
  bestAccuracy: GameRecord
  worstAccuracy: GameRecord
  biggestRoundWin: GameRecord
  biggestRoundLoss: GameRecord
  longestStreak: GameRecord
}

export function calculateGameRecords(game: GameSummary): GameRecords {
  const scores = game.scores.map((score) => ({
    player: score.player,
    value: score.score,
    accuracy: Math.round((score.correctGuesses / game.rounds) * 100),
    date: new Date(game.date),
  }))

  const roundScores =
    game.roundScores?.flatMap((round) =>
      round.scores.map((score) => ({
        player: score.player,
        value: score.score,
        correctGuess: score.correctGuess,
        round: round.round,
      })),
    ) ?? []

  // Calculate longest streak
  let maxStreak = 0
  let streakPlayer = ''
  let currentStreak = 0
  let lastPlayer = ''

  roundScores.forEach((score) => {
    if (score.player === lastPlayer && score.correctGuess) {
      currentStreak++
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
        streakPlayer = score.player
      }
    } else if (score.correctGuess) {
      currentStreak = 1
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
        streakPlayer = score.player
      }
    } else {
      currentStreak = 0
    }
    lastPlayer = score.player
  })

  return {
    highestScore: scores.reduce((max, curr) =>
      curr.value > max.value ? curr : max,
    ),
    lowestScore: scores.reduce((min, curr) =>
      curr.value < min.value ? curr : min,
    ),
    bestAccuracy: scores.reduce((max, curr) =>
      curr.accuracy > max.accuracy ? curr : max,
    ),
    worstAccuracy: scores.reduce((min, curr) =>
      curr.accuracy < min.accuracy ? curr : min,
    ),
    biggestRoundWin: roundScores.reduce((max, curr) =>
      curr.value > max.value ? curr : max,
    ),
    biggestRoundLoss: roundScores.reduce((min, curr) =>
      curr.value < min.value ? curr : min,
    ),
    longestStreak: {
      player: streakPlayer,
      value: maxStreak,
    },
  }
}

export function calculateAllTimeRecords(games: GameSummary[]): GameRecords {
  const allScores = games.flatMap((game) =>
    game.scores.map((score) => ({
      player: score.player,
      value: score.score,
      accuracy: Math.round((score.correctGuesses / game.rounds) * 100),
      date: new Date(game.date),
    })),
  )

  const allRoundScores = games
    .filter((game) => game.roundScores)
    .flatMap((game) =>
      game.roundScores!.flatMap((round) =>
        round.scores.map((score) => ({
          player: score.player,
          value: score.score,
          correctGuess: score.correctGuess,
          date: new Date(game.date),
          round: round.round,
        })),
      ),
    )

  // Calculate longest streak
  let maxStreak = 0
  let streakPlayer = ''
  let streakDate: Date | null = null
  let currentStreak = 0
  let lastPlayer = ''

  allRoundScores.forEach((score) => {
    if (score.player === lastPlayer && score.correctGuess) {
      currentStreak++
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
        streakPlayer = score.player
        streakDate = score.date
      }
    } else if (score.correctGuess) {
      currentStreak = 1
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
        streakPlayer = score.player
        streakDate = score.date
      }
    } else {
      currentStreak = 0
    }
    lastPlayer = score.player
  })

  return {
    highestScore: allScores.reduce((max, curr) =>
      curr.value > max.value ? curr : max,
    ),
    lowestScore: allScores.reduce((min, curr) =>
      curr.value < min.value ? curr : min,
    ),
    bestAccuracy: allScores.reduce((max, curr) =>
      curr.accuracy > max.accuracy ? curr : max,
    ),
    worstAccuracy: allScores.reduce((min, curr) =>
      curr.accuracy < min.accuracy ? curr : min,
    ),
    biggestRoundWin: allRoundScores.reduce((max, curr) =>
      curr.value > max.value ? curr : max,
    ),
    biggestRoundLoss: allRoundScores.reduce((min, curr) =>
      curr.value < min.value ? curr : min,
    ),
    longestStreak: {
      player: streakPlayer,
      value: maxStreak,
      date: streakDate,
    },
  }
}

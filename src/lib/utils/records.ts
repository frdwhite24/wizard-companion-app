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

  const bestAccuracyScore = scores.reduce(
    (max, curr) => (curr.accuracy > max.accuracy ? curr : max),
    scores[0] || { player: '', value: 0, accuracy: -Infinity },
  )

  const worstAccuracyScore = scores.reduce(
    (min, curr) => (curr.accuracy < min.accuracy ? curr : min),
    scores[0] || { player: '', value: 0, accuracy: Infinity },
  )

  return {
    highestScore: scores.reduce(
      (max, curr) => (curr.value > max.value ? curr : max),
      scores[0] || { player: '', value: -Infinity },
    ),
    lowestScore: scores.reduce(
      (min, curr) => (curr.value < min.value ? curr : min),
      scores[0] || { player: '', value: Infinity },
    ),
    bestAccuracy: {
      player: bestAccuracyScore.player,
      value: bestAccuracyScore.accuracy,
    },
    worstAccuracy: {
      player: worstAccuracyScore.player,
      value: worstAccuracyScore.accuracy,
    },
    biggestRoundWin: roundScores.reduce(
      (max, curr) => (curr.value > max.value ? curr : max),
      roundScores[0] || { player: '', value: -Infinity },
    ),
    biggestRoundLoss: roundScores.reduce(
      (min, curr) => (curr.value < min.value ? curr : min),
      roundScores[0] || { player: '', value: Infinity },
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

  const bestAccuracyScore = allScores.reduce(
    (max, curr) => (curr.accuracy > max.accuracy ? curr : max),
    allScores[0] || { player: '', value: 0, accuracy: -Infinity, date: null },
  )

  const worstAccuracyScore = allScores.reduce(
    (min, curr) => (curr.accuracy < min.accuracy ? curr : min),
    allScores[0] || { player: '', value: 0, accuracy: Infinity, date: null },
  )

  return {
    highestScore: allScores.reduce(
      (max, curr) => (curr.value > max.value ? curr : max),
      allScores[0] || { player: '', value: -Infinity },
    ),
    lowestScore: allScores.reduce(
      (min, curr) => (curr.value < min.value ? curr : min),
      allScores[0] || { player: '', value: Infinity },
    ),
    bestAccuracy: {
      player: bestAccuracyScore.player,
      value: bestAccuracyScore.accuracy,
      date: bestAccuracyScore.date,
    },
    worstAccuracy: {
      player: worstAccuracyScore.player,
      value: worstAccuracyScore.accuracy,
      date: worstAccuracyScore.date,
    },
    biggestRoundWin: allRoundScores.reduce(
      (max, curr) => (curr.value > max.value ? curr : max),
      allRoundScores[0] || { player: '', value: -Infinity },
    ),
    biggestRoundLoss: allRoundScores.reduce(
      (min, curr) => (curr.value < min.value ? curr : min),
      allRoundScores[0] || { player: '', value: Infinity },
    ),
    longestStreak: {
      player: streakPlayer,
      value: maxStreak,
      date: streakDate,
    },
  }
}

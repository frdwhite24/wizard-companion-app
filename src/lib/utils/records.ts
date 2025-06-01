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

  // Calculate longest streak (per player)
  let maxStreak = 0
  let streakPlayer = ''
  let streakDate: Date | null = null
  const streaks: Record<string, number> = {}

  // Sort roundScores by round to ensure order
  const sortedRoundScores = [...roundScores].sort((a, b) => {
    const aRound = typeof a.round === 'number' ? a.round : 0
    const bRound = typeof b.round === 'number' ? b.round : 0
    return aRound - bRound
  })

  sortedRoundScores.forEach((score) => {
    const prevStreak = streaks[score.player] ?? 0
    if (score.correctGuess) {
      const newStreak = prevStreak + 1
      streaks[score.player] = newStreak
      if (newStreak > maxStreak) {
        maxStreak = newStreak
        streakPlayer = score.player
        streakDate = new Date(game.date)
      }
    } else {
      streaks[score.player] = 0
    }
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
      date: new Date(game.date),
    },
    worstAccuracy: {
      player: worstAccuracyScore.player,
      value: worstAccuracyScore.accuracy,
      date: new Date(game.date),
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
      date: streakDate,
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

  // Calculate longest streak (per player)
  let maxStreak = 0
  let streakPlayer = ''
  let streakDate: Date | null = null
  const streaks: Record<string, number> = {}

  // Sort allRoundScores by date and round to ensure order
  const sortedAllRoundScores = [...allRoundScores].sort((a, b) => {
    const dateDiff = (a.date?.getTime?.() ?? 0) - (b.date?.getTime?.() ?? 0)
    if (dateDiff !== 0) return dateDiff
    const aRound = typeof a.round === 'number' ? a.round : 0
    const bRound = typeof b.round === 'number' ? b.round : 0
    return aRound - bRound
  })

  sortedAllRoundScores.forEach((score) => {
    const prevStreak = streaks[score.player] ?? 0
    if (score.correctGuess) {
      const newStreak = prevStreak + 1
      streaks[score.player] = newStreak
      if (newStreak > maxStreak) {
        maxStreak = newStreak
        streakPlayer = score.player
        streakDate = score.date
      }
    } else {
      streaks[score.player] = 0
    }
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

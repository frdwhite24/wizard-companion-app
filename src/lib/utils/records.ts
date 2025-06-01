import type { GameSummary } from '../gameHistory'

export interface GameRecord {
  player: string
  value: number
  date?: Date | null
  round?: number | undefined
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
        date: new Date(game.date),
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

export function calculateAllTimeRecordsFromGameRecords(
  gameRecords: GameRecords[],
): GameRecords {
  // Helper function to find the record with the highest/lowest value
  const findExtremeRecord = (
    records: GameRecord[],
    isMax: boolean,
  ): GameRecord => {
    if (records.length === 0) {
      // Return a default record with all possible properties
      return {
        player: '',
        value: isMax ? -Infinity : Infinity,
        date: null,
        round: undefined,
      }
    }
    const firstRecord = records[0]
    if (!firstRecord) {
      return {
        player: '',
        value: isMax ? -Infinity : Infinity,
        date: null,
        round: undefined,
      }
    }
    return records.reduce((extreme, curr) => {
      if (isMax) {
        return curr.value > extreme.value ? curr : extreme
      }
      return curr.value < extreme.value ? curr : extreme
    }, firstRecord)
  }

  // Collect all records of each type
  const highestScores = gameRecords.map((record) => record.highestScore)
  const lowestScores = gameRecords.map((record) => record.lowestScore)
  const bestAccuracies = gameRecords.map((record) => record.bestAccuracy)
  const worstAccuracies = gameRecords.map((record) => record.worstAccuracy)
  const biggestRoundWins = gameRecords.map((record) => record.biggestRoundWin)
  const biggestRoundLosses = gameRecords.map(
    (record) => record.biggestRoundLoss,
  )
  const longestStreaks = gameRecords.map((record) => record.longestStreak)

  const highestScore = findExtremeRecord(highestScores, true)
  const lowestScore = findExtremeRecord(lowestScores, false)
  const bestAccuracy = findExtremeRecord(bestAccuracies, true)
  const worstAccuracy = findExtremeRecord(worstAccuracies, false)
  const biggestRoundWin = findExtremeRecord(biggestRoundWins, true)
  const biggestRoundLoss = findExtremeRecord(biggestRoundLosses, false)
  const longestStreak = findExtremeRecord(longestStreaks, true)

  return {
    highestScore,
    lowestScore,
    bestAccuracy,
    worstAccuracy,
    biggestRoundWin,
    biggestRoundLoss,
    longestStreak,
  }
}

export function calculateAllTimeRecords(games: GameSummary[]): GameRecords {
  // Calculate records for each individual game
  const individualGameRecords = games.map((game) => calculateGameRecords(game))

  // Calculate all-time records from the individual game records
  return calculateAllTimeRecordsFromGameRecords(individualGameRecords)
}

import { describe, it, expect } from 'vitest'
import { calculateGameRecords, calculateAllTimeRecords } from './records'
import type { GameSummary } from '../gameHistory'
import {
  testGameSummary,
  emptyGameSummary,
  multipleGameSummaries,
} from './__testData__/testGameData'

describe('Game Records Calculation', () => {
  describe('Calculating the highest score for a single game', () => {
    it('identifies the player with the highest score', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.highestScore).toMatchObject({
        player: 'David',
        value: 140,
        date: new Date(testGameSummary.date),
      })
    })

    it('handles ties for highest score', () => {
      const tiedGame: GameSummary = {
        ...testGameSummary,
        scores: [
          { player: 'Alice', score: 100, correctGuesses: 3 },
          { player: 'Bob', score: 100, correctGuesses: 3 },
        ],
      }
      const records = calculateGameRecords(tiedGame)
      expect(records.highestScore.value).toBe(100)
      expect(['Alice', 'Bob']).toContain(records.highestScore.player)
    })

    it('returns sensible defaults for empty games', () => {
      const records = calculateGameRecords(emptyGameSummary)
      expect(records.highestScore).toMatchObject({
        player: '',
        value: -Infinity,
      })
    })
  })

  describe('Calculating the lowest score for a single game', () => {
    it('identifies the player with the lowest score', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.lowestScore).toMatchObject({
        player: 'Bob',
        value: 20,
        date: new Date(testGameSummary.date),
      })
    })

    it('handles ties for lowest score', () => {
      const tiedGame: GameSummary = {
        ...testGameSummary,
        scores: [
          { player: 'Alice', score: -10, correctGuesses: 1 },
          { player: 'Bob', score: -10, correctGuesses: 1 },
        ],
      }
      const records = calculateGameRecords(tiedGame)
      expect(records.lowestScore.value).toBe(-10)
      expect(['Alice', 'Bob']).toContain(records.lowestScore.player)
    })

    it('returns sensible defaults for empty games', () => {
      const records = calculateGameRecords(emptyGameSummary)
      expect(records.lowestScore).toMatchObject({
        player: '',
        value: Infinity,
      })
    })
  })

  describe('Calculating best and worst guess accuracy', () => {
    it('identifies the player with the best guess accuracy', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.bestAccuracy).toMatchObject({
        player: 'David',
        value: 100,
        date: new Date(testGameSummary.date),
      })
    })

    it('identifies the player with the worst guess accuracy', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.worstAccuracy).toMatchObject({
        player: 'Bob',
        value: 40,
        date: new Date(testGameSummary.date),
      })
    })

    it('handles ties for accuracy', () => {
      const tiedGame: GameSummary = {
        ...testGameSummary,
        scores: [
          { player: 'Alice', score: 50, correctGuesses: 3 },
          { player: 'Bob', score: 50, correctGuesses: 3 },
        ],
        rounds: 5,
      }
      const records = calculateGameRecords(tiedGame)
      expect(records.bestAccuracy.value).toBe(60)
      expect(['Alice', 'Bob']).toContain(records.bestAccuracy.player)
    })
  })

  describe('Calculating the biggest round win and loss', () => {
    it('identifies the biggest round win', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.biggestRoundWin).toMatchObject({
        player: 'Charlie',
        value: 40,
        round: 2,
      })
    })

    it('identifies the biggest round loss', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.biggestRoundLoss).toMatchObject({
        player: 'Charlie',
        value: -20,
        round: 3,
      })
    })

    it('handles missing roundScores gracefully', () => {
      const { roundScores: _, ...gameWithoutRounds } = testGameSummary
      const records = calculateGameRecords(gameWithoutRounds)
      expect(records.biggestRoundWin).toMatchObject({
        player: '',
        value: -Infinity,
      })
      expect(records.biggestRoundLoss).toMatchObject({
        player: '',
        value: Infinity,
      })
    })
  })

  describe('Identifying the player with the longest correct streak', () => {
    it('finds the correct player and streak length for a simple game', () => {
      const records = calculateGameRecords(testGameSummary)
      expect(records.longestStreak).toMatchObject({
        player: 'David',
        value: 5,
        date: new Date(testGameSummary.date),
      })
    })

    it('handles ties by picking the first to achieve the streak', () => {
      const tiedStreakGame: GameSummary = {
        ...testGameSummary,
        roundScores: [
          {
            round: 1,
            scores: [
              { player: 'Alice', score: 20, correctGuess: true },
              { player: 'Bob', score: 20, correctGuess: true },
            ],
          },
          {
            round: 2,
            scores: [
              { player: 'Alice', score: 20, correctGuess: true },
              { player: 'Bob', score: 20, correctGuess: true },
            ],
          },
        ],
      }
      const records = calculateGameRecords(tiedStreakGame)
      expect(records.longestStreak.value).toBe(2)
      expect(records.longestStreak.player).toBe('Alice')
    })

    it('returns 0 and no player for games with no correct guesses', () => {
      const noCorrectGame: GameSummary = {
        ...testGameSummary,
        roundScores: [
          {
            round: 1,
            scores: [
              { player: 'Alice', score: -10, correctGuess: false },
              { player: 'Bob', score: -10, correctGuess: false },
            ],
          },
        ],
      }
      const records = calculateGameRecords(noCorrectGame)
      expect(records.longestStreak).toMatchObject({
        player: '',
        value: 0,
        date: null,
      })
    })

    it('handles games with missing roundScores', () => {
      const { roundScores: _, ...gameWithoutRounds } = testGameSummary
      const records = calculateGameRecords(gameWithoutRounds)
      expect(records.longestStreak).toMatchObject({
        player: '',
        value: 0,
        date: null,
      })
    })
  })
})

describe('All-Time Records Calculation', () => {
  describe('Calculating all-time highest and lowest scores', () => {
    it('finds the player with the highest score across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.highestScore).toMatchObject({
        player: 'David',
        value: 140,
        date: new Date('2024-03-20T12:00:00Z'),
      })
    })

    it('finds the player with the lowest score across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.lowestScore).toMatchObject({
        player: 'Charlie',
        value: 10,
        date: new Date('2024-03-22T12:00:00Z'),
      })
    })

    it('handles ties and empty game lists', () => {
      const records = calculateAllTimeRecords([])
      expect(records.highestScore).toMatchObject({
        player: '',
        value: -Infinity,
      })
      expect(records.lowestScore).toMatchObject({
        player: '',
        value: Infinity,
      })
    })
  })

  describe('Calculating all-time best and worst guess accuracy', () => {
    it('finds the player with the best accuracy across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.bestAccuracy).toMatchObject({
        player: 'David',
        value: 100,
        date: new Date('2024-03-20T12:00:00Z'),
      })
    })

    it('finds the player with the worst accuracy across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.worstAccuracy).toMatchObject({
        player: 'Charlie',
        value: 33,
        date: new Date('2024-03-21T12:00:00Z'),
      })
    })

    it('handles ties and empty game lists', () => {
      const records = calculateAllTimeRecords([])
      expect(records.bestAccuracy).toMatchObject({
        player: '',
        value: -Infinity,
        date: null,
      })
      expect(records.worstAccuracy).toMatchObject({
        player: '',
        value: Infinity,
        date: null,
      })
    })
  })

  describe('Calculating all-time biggest round win and loss', () => {
    it('finds the biggest round win across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.biggestRoundWin).toMatchObject({
        player: 'Charlie',
        value: 50,
        date: new Date('2024-03-21T12:00:00Z'),
        round: 3,
      })
    })

    it('finds the biggest round loss across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.biggestRoundLoss).toMatchObject({
        player: 'Charlie',
        value: -20,
        date: new Date('2024-03-20T12:00:00Z'),
        round: 3,
      })
    })

    it('handles missing roundScores gracefully', () => {
      const gamesWithoutRounds = multipleGameSummaries.map(
        ({ roundScores: _, ...game }) => game,
      )
      const records = calculateAllTimeRecords(gamesWithoutRounds)
      expect(records.biggestRoundWin).toMatchObject({
        player: '',
        value: -Infinity,
      })
      expect(records.biggestRoundLoss).toMatchObject({
        player: '',
        value: Infinity,
      })
    })
  })

  describe('Identifying the player with the longest correct streak across all games', () => {
    it('finds the correct player and streak length across all games', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.longestStreak).toMatchObject({
        player: 'David',
        value: 5,
        date: new Date('2024-03-20T12:00:00Z'),
      })
    })

    it('handles ties by picking the first to achieve the streak', () => {
      const records = calculateAllTimeRecords(multipleGameSummaries)
      expect(records.longestStreak.player).toBe('David')
    })

    it('returns 0 and no player for no correct guesses in any game', () => {
      const noCorrectGames = multipleGameSummaries.map((game) => {
        if (!game.roundScores) {
          return game
        }
        return {
          ...game,
          roundScores: game.roundScores.map((round) => ({
            ...round,
            scores: round.scores.map((score) => ({
              ...score,
              correctGuess: false,
            })),
          })),
        }
      })
      const records = calculateAllTimeRecords(noCorrectGames)
      expect(records.longestStreak).toMatchObject({
        player: '',
        value: 0,
        date: null,
      })
    })

    it('handles games with missing roundScores', () => {
      const gamesWithoutRounds = multipleGameSummaries.map(
        ({ roundScores: _, ...game }) => game,
      )
      const records = calculateAllTimeRecords(gamesWithoutRounds)
      expect(records.longestStreak).toMatchObject({
        player: '',
        value: 0,
        date: null,
      })
    })
  })
})

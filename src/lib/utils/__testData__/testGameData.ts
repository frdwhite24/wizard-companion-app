import type { GameSummary } from '../../gameHistory'

// Test data for single game records
export const testGameSummary: GameSummary = {
  id: 'test-game-1',
  date: '2024-03-20T12:00:00Z',
  players: ['Alice', 'Bob', 'Charlie', 'David', 'Emma'],
  rounds: 5,
  scores: [
    { player: 'Alice', score: 50, correctGuesses: 3 },
    { player: 'Bob', score: 20, correctGuesses: 2 },
    { player: 'Charlie', score: 90, correctGuesses: 4 },
    { player: 'David', score: 140, correctGuesses: 5 },
    { player: 'Emma', score: 40, correctGuesses: 3 },
  ],
  roundScores: [
    {
      round: 1,
      scores: [
        { player: 'Alice', score: -10, correctGuess: false },
        { player: 'Bob', score: 30, correctGuess: true },
        { player: 'Charlie', score: 20, correctGuess: true },
        { player: 'David', score: 20, correctGuess: true },
        { player: 'Emma', score: 20, correctGuess: true },
      ],
    },
    {
      round: 2,
      scores: [
        { player: 'Alice', score: 20, correctGuess: true },
        { player: 'Bob', score: -10, correctGuess: false },
        { player: 'Charlie', score: 40, correctGuess: true },
        { player: 'David', score: 20, correctGuess: true },
        { player: 'Emma', score: 20, correctGuess: true },
      ],
    },
    {
      round: 3,
      scores: [
        { player: 'Alice', score: 20, correctGuess: true },
        { player: 'Bob', score: -10, correctGuess: false },
        { player: 'Charlie', score: -20, correctGuess: false },
        { player: 'David', score: 30, correctGuess: true },
        { player: 'Emma', score: 20, correctGuess: true },
      ],
    },
    {
      round: 4,
      scores: [
        { player: 'Alice', score: 30, correctGuess: true },
        { player: 'Bob', score: 20, correctGuess: true },
        { player: 'Charlie', score: 20, correctGuess: true },
        { player: 'David', score: 30, correctGuess: true },
        { player: 'Emma', score: -10, correctGuess: false },
      ],
    },
    {
      round: 5,
      scores: [
        { player: 'Alice', score: -10, correctGuess: false },
        { player: 'Bob', score: -10, correctGuess: false },
        { player: 'Charlie', score: 30, correctGuess: true },
        { player: 'David', score: 40, correctGuess: true },
        { player: 'Emma', score: -10, correctGuess: false },
      ],
    },
  ],
}

export const emptyGameSummary: GameSummary = {
  id: 'empty-game',
  date: '2024-03-20T12:00:00Z',
  players: [],
  rounds: 0,
  scores: [],
}

// Test data for all-time records
export const multipleGameSummaries: GameSummary[] = [
  testGameSummary,
  {
    id: 'test-game-2',
    date: '2024-03-21T12:00:00Z',
    players: ['Alice', 'Bob', 'Charlie'],
    rounds: 3,
    scores: [
      { player: 'Alice', score: 100, correctGuesses: 3 },
      { player: 'Bob', score: 80, correctGuesses: 2 },
      { player: 'Charlie', score: 60, correctGuesses: 1 },
    ],
    roundScores: [
      {
        round: 1,
        scores: [
          { player: 'Alice', score: 40, correctGuess: true },
          { player: 'Bob', score: 30, correctGuess: true },
          { player: 'Charlie', score: 20, correctGuess: true },
        ],
      },
      {
        round: 2,
        scores: [
          { player: 'Alice', score: 40, correctGuess: true },
          { player: 'Bob', score: 30, correctGuess: true },
          { player: 'Charlie', score: -10, correctGuess: false },
        ],
      },
      {
        round: 3,
        scores: [
          { player: 'Alice', score: 20, correctGuess: true },
          { player: 'Bob', score: 20, correctGuess: true },
          { player: 'Charlie', score: 50, correctGuess: false },
        ],
      },
    ],
  },
  {
    id: 'test-game-3',
    date: '2024-03-22T12:00:00Z',
    players: ['Alice', 'Bob', 'Charlie', 'David'],
    rounds: 2,
    scores: [
      { player: 'Alice', score: 50, correctGuesses: 2 },
      { player: 'Bob', score: 20, correctGuesses: 1 },
      { player: 'Charlie', score: 10, correctGuesses: 1 },
      { player: 'David', score: 50, correctGuesses: 2 },
    ],
    roundScores: [
      {
        round: 1,
        scores: [
          { player: 'Alice', score: 20, correctGuess: true },
          { player: 'Bob', score: 30, correctGuess: true },
          { player: 'Charlie', score: -10, correctGuess: false },
          { player: 'David', score: 20, correctGuess: true },
        ],
      },
      {
        round: 2,
        scores: [
          { player: 'Alice', score: 30, correctGuess: true },
          { player: 'Bob', score: -10, correctGuess: false },
          { player: 'Charlie', score: 20, correctGuess: true },
          { player: 'David', score: 30, correctGuess: true },
        ],
      },
    ],
  },
]

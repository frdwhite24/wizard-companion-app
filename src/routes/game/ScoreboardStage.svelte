<script lang="ts">
  import { onMount } from 'svelte'
  import { loadGameHistory } from '$lib/gameHistory'
  import {
    calculateGameRecords,
    calculateAllTimeRecords,
  } from '$lib/utils/records'
  import { closestTo } from 'date-fns'
  import { isEqual } from 'date-fns'

  export let currentRound: number
  export let players: string[]
  export let rounds: Array<{
    guesses: Record<string, number>
    tricks: Record<string, number>
    scores: Record<string, number>
  }>
  export let totalRounds: number
  export let gameUpdatedAt: number

  // Calculate single round score
  function calculateRoundScore(guess: number, actual: number): number {
    if (guess === actual) {
      return 20 + actual * 10
    }
    return -10 * Math.abs(guess - actual)
  }

  // Calculate results with cumulative scores
  $: roundResults = rounds.slice(0, currentRound).map((round, index) => {
    const playerScores = players.map((player) => {
      // Calculate scores for all previous rounds plus this one
      const cumulativeScore = rounds.slice(0, index + 1).reduce((total, r) => {
        return (
          total +
          calculateRoundScore(r.guesses[player] ?? 0, r.tricks[player] ?? 0)
        )
      }, 0)

      return {
        player,
        guess: round.guesses[player] ?? 0,
        actual: round.tricks[player] ?? 0,
        cumulativeScore,
      }
    })

    return {
      roundNumber: index + 1,
      results: playerScores,
    }
  })

  function getCorrectRoundsCount(player: string): number {
    return rounds
      .slice(0, currentRound)
      .filter((round) => round.guesses[player] === round.tricks[player]).length
  }

  // Get player rankings based on latest scores and correct rounds
  $: latestScores = roundResults[roundResults.length - 1]?.results ?? []
  $: playerRankings = [...latestScores]
    .map((result) => ({
      ...result,
      correctRounds: getCorrectRoundsCount(result.player),
    }))
    .sort((a, b) => {
      // First sort by score
      if (b.cumulativeScore !== a.cumulativeScore) {
        return b.cumulativeScore - a.cumulativeScore
      }
      // Then by correct rounds
      return b.correctRounds - a.correctRounds
    })
    .reduce<Record<string, number>>((acc, result, index, array) => {
      // Determine actual position considering ties
      const position = array
        .slice(0, index)
        .filter(
          (prev) =>
            prev.cumulativeScore > result.cumulativeScore ||
            (prev.cumulativeScore === result.cumulativeScore &&
              prev.correctRounds > result.correctRounds),
        ).length

      acc[result.player] = position
      return acc
    }, {})

  // Sort players by their current ranking
  $: orderedPlayers = [...players].sort((a, b) => {
    const aScore =
      latestScores.find((r) => r.player === a)?.cumulativeScore ?? 0
    const bScore =
      latestScores.find((r) => r.player === b)?.cumulativeScore ?? 0
    const aCorrect = getCorrectRoundsCount(a)
    const bCorrect = getCorrectRoundsCount(b)

    if (bScore !== aScore) {
      return bScore - aScore
    }
    return bCorrect - aCorrect
  })

  function getMedal(position: number, player: string): string {
    const playersAhead = Object.values(playerRankings).filter(
      (p) => p < position,
    ).length

    // Get current player's score and correct rounds
    const playerScore = latestScores.find(
      (r) => r.player === player,
    )?.cumulativeScore
    const playerCorrect = getCorrectRoundsCount(player)

    // Find if there are players with same score
    const hasSameScore = Object.entries(playerRankings).some(
      ([otherPlayer, _]) => {
        if (otherPlayer === player) {
          return false
        }
        const otherScore = latestScores.find(
          (r) => r.player === otherPlayer,
        )?.cumulativeScore
        return playerScore === otherScore
      },
    )

    // Build medal string
    let medal = ''
    if (position === 0) {
      medal = '🥇'
    } else if (playersAhead === 1) {
      medal = '🥈'
    } else if (playersAhead === 2) {
      medal = '🥉'
    } else if (position === players.length - 1) {
      // Add turtle for last place if they don't have a medal
      medal = '🐢'
    }

    // Add correct rounds count if there's a same score (even for first place)
    if (hasSameScore) {
      medal += ` (${playerCorrect})`
    }

    return medal
  }

  let tableContainer: HTMLDivElement | null = null

  function scrollToEnd() {
    if (tableContainer) {
      tableContainer.scrollLeft =
        tableContainer.scrollWidth - tableContainer.clientWidth
    }
  }

  onMount(() => {
    scrollToEnd()
  })

  // Calculate game records
  let gameHistory = loadGameHistory()
  $: currentGameSummary = {
    id: 'current',
    date: new Date().toISOString(),
    players,
    rounds: currentRound,
    scores: players.map((player) => ({
      player,
      score:
        latestScores.find((r) => r.player === player)?.cumulativeScore ?? 0,
      correctGuesses: getCorrectRoundsCount(player),
    })),
    roundScores: rounds.slice(0, currentRound).map((round, index) => ({
      round: index + 1,
      scores: players.map((player) => ({
        player,
        score: calculateRoundScore(
          round.guesses[player] ?? 0,
          round.tricks[player] ?? 0,
        ),
        correctGuess: round.guesses[player] === round.tricks[player],
      })),
    })),
  }
  $: currentGameRecords = calculateGameRecords(currentGameSummary)
  $: currentGameDateFromHistory = closestTo(
    new Date(gameUpdatedAt),
    gameHistory.map((game) => game.date),
  )
  $: currentGameId =
    currentGameDateFromHistory &&
    gameHistory.find((game) => isEqual(game.date, currentGameDateFromHistory))
      ?.id
  $: allTimeRecords = calculateAllTimeRecords(
    currentGameId
      ? gameHistory.filter((game) => game.id !== currentGameId)
      : gameHistory,
  )

  function getRankText(value: number, allTimeValue: number): string {
    if (value > allTimeValue) {
      return 'New Record!'
    }
    if (value === allTimeValue) {
      return 'Tied Record'
    }
    return `#${Math.round((value / allTimeValue) * 100)}% of Record`
  }
</script>

<h1>See the scores</h1>

<div class="scoreboard-container">
  <div class="scoreboard-wrapper" bind:this={tableContainer}>
    <table>
      <thead>
        <tr>
          <th rowspan="2">Player</th>
          {#each roundResults as round (round.roundNumber)}
            <th colspan="4">Round {round.roundNumber}</th>
          {/each}
        </tr>
        <tr>
          {#each roundResults as round (round.roundNumber)}
            <th>Guess</th>
            <th>Won</th>
            <th>Round</th>
            <th>Score</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each orderedPlayers as player (player)}
          <tr>
            <td>
              <span class="player-cell">
                <span class="player-text">{player}</span>
                <span class="medal"
                  >{getMedal(playerRankings[player] ?? 0, player)}</span
                >
              </span>
            </td>
            {#each roundResults as round (round.roundNumber)}
              {@const playerResult = round.results.find(
                (r) => r.player === player,
              )}
              <td>{playerResult?.guess}</td>
              <td>{playerResult?.actual}</td>
              <td
                class={calculateRoundScore(
                  playerResult?.guess ?? 0,
                  playerResult?.actual ?? 0,
                ) > 0
                  ? 'positive'
                  : 'negative'}
              >
                {calculateRoundScore(
                  playerResult?.guess ?? 0,
                  playerResult?.actual ?? 0,
                ) > 0
                  ? '+'
                  : ''}{calculateRoundScore(
                  playerResult?.guess ?? 0,
                  playerResult?.actual ?? 0,
                )}
              </td>
              <td>
                {playerResult?.cumulativeScore ?? 0}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if currentRound === totalRounds}
  <div class="records">
    <div class="record-card high">
      <div class="record-label">Top Score</div>
      <div class="record-value">{currentGameRecords.highestScore.value}</div>
      <div class="record-details">
        {currentGameRecords.highestScore.player}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.highestScore.value,
            allTimeRecords.highestScore.value,
          )}
        </div>
      </div>
    </div>
    <div class="record-card low">
      <div class="record-label">Lowest Score</div>
      <div class="record-value">{currentGameRecords.lowestScore.value}</div>
      <div class="record-details">
        {currentGameRecords.lowestScore.player}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.lowestScore.value,
            allTimeRecords.lowestScore.value,
          )}
        </div>
      </div>
    </div>
    <div class="record-card high">
      <div class="record-label">Best Guess Accuracy</div>
      <div class="record-value">{currentGameRecords.bestAccuracy.value}%</div>
      <div class="record-details">
        {currentGameRecords.bestAccuracy.player}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.bestAccuracy.value,
            allTimeRecords.bestAccuracy.value,
          )}
        </div>
      </div>
    </div>
    <div class="record-card low">
      <div class="record-label">Worst Guess Accuracy</div>
      <div class="record-value">{currentGameRecords.worstAccuracy.value}%</div>
      <div class="record-details">
        {currentGameRecords.worstAccuracy.player}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.worstAccuracy.value,
            allTimeRecords.worstAccuracy.value,
          )}
        </div>
      </div>
    </div>
    <div class="record-card high">
      <div class="record-label">Biggest Round Win</div>
      <div class="record-value">{currentGameRecords.biggestRoundWin.value}</div>
      <div class="record-details">
        {currentGameRecords.biggestRoundWin.player} in round {currentGameRecords
          .biggestRoundWin.round}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.biggestRoundWin.value,
            allTimeRecords.biggestRoundWin.value,
          )}
        </div>
      </div>
    </div>
    <div class="record-card low">
      <div class="record-label">Biggest Round Loss</div>
      <div class="record-value">
        {currentGameRecords.biggestRoundLoss.value}
      </div>
      <div class="record-details">
        {currentGameRecords.biggestRoundLoss.player} in round {currentGameRecords
          .biggestRoundLoss.round}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.biggestRoundLoss.value,
            allTimeRecords.biggestRoundLoss.value,
          )}
        </div>
      </div>
    </div>
    <div class="record-card high">
      <div class="record-label">Longest Correct Streak</div>
      <div class="record-value">{currentGameRecords.longestStreak.value}</div>
      <div class="record-details">
        {currentGameRecords.longestStreak.player}
        <div class="record-comparison">
          {getRankText(
            currentGameRecords.longestStreak.value,
            allTimeRecords.longestStreak.value,
          )}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .scoreboard-wrapper {
    overflow-x: auto;
    width: 100%;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .scoreboard-wrapper::-webkit-scrollbar {
    display: none;
  }

  table {
    width: max-content;
    min-width: 100%; /* Ensure table is at least viewport width */
  }

  .positive {
    color: rgb(52, 211, 153);
  }

  .negative {
    color: rgb(239, 68, 68);
  }

  .player-cell {
    display: flex;
    align-items: center;
    white-space: nowrap;
    width: fit-content; /* Allow cell to shrink */
    min-width: 0; /* Allow flex item to shrink below content size */
    max-width: 9rem; /* Maximum width */
    margin: 0;
  }

  .player-text {
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: left;
    min-width: 5ch; /* Ensure at least 5 characters visible */
  }

  .medal {
    flex-shrink: 0; /* Prevent medal from shrinking */
    margin-left: 0.5rem;
  }

  /* Update the sticky column selector to only target the Player column */
  th[rowspan='2']:first-child,
  td:first-child {
    position: sticky;
    left: -1px; /* Pull slightly left to cover any gap */
    background-color: var(--pico-background-color);
    z-index: 2;
  }

  /* Add a pseudo-element for the border that will be part of the sticky stacking context */
  th[rowspan='2']:first-child::after,
  td:first-child::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--pico-border-width);
    background-color: var(--pico-table-border-color);
    z-index: 2;
  }

  /* Remove .round-data grid styling */
  td {
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  /* Align round headers with their sub-columns */
  th[colspan='4'] {
    text-align: center; /* Align with first sub-column */
  }

  /* Make header text uniform height small caps */
  th {
    font-variant-caps: all-small-caps;
    letter-spacing: 0.05em;
  }

  /* Make player column flex to fill space */
  td:first-child {
    width: 100%; /* Allow cell to grow */
    min-width: 5ch; /* Keep minimum readable width */
    max-width: 9rem; /* Cap maximum width */
  }

  /* When table is wider than viewport, revert to fixed width */
  @media (min-width: 100vw) {
    td:first-child {
      width: fit-content;
    }
  }

  /* Target the first column of each round (every 4th column starting from column 6) */
  td:nth-child(4n + 6),
  th:nth-child(4n + 5) {
    border-left: var(--pico-border-width) solid var(--pico-table-border-color);
  }

  /* Reduce horizontal padding for all cells except Player column */
  tr > td:nth-child(n + 2),
  tr:last-child > th {
    padding-inline: 4px;
  }

  .records {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }

  .record-card {
    padding: 1rem;
    border-radius: var(--pico-border-radius);
    text-align: center;
  }

  .record-card.high {
    background: rgba(52, 211, 153, 0.1);
    color: var(--high-score-color, rgb(23, 95, 69));
  }

  .record-card.low {
    background: rgba(239, 68, 68, 0.1);
    color: var(--low-score-color, rgb(147, 42, 42));
  }

  .record-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .record-value {
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .record-details {
    font-size: 0.85rem;
    opacity: 0.8;
    line-height: 1.4;
  }

  .record-comparison {
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.25rem;
  }

  @media (prefers-color-scheme: light) {
    * {
      --high-score-color: rgb(23, 95, 69);
      --low-score-color: rgb(147, 42, 42);
    }
  }

  @media (prefers-color-scheme: dark) {
    * {
      --high-score-color: rgb(74, 222, 128);
      --low-score-color: rgb(248, 113, 113);
    }
  }
</style>

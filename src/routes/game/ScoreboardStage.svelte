<script lang="ts">
  import { onMount } from 'svelte'
  export let currentRound: number
  export let players: string[]
  export let rounds: Array<{
    guesses: Record<string, number>
    tricks: Record<string, number>
    scores: Record<string, number>
  }>

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
    .reduce(
      (acc, result, index, array) => {
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
      },
      {} as Record<string, number>,
    )

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
        if (otherPlayer === player) return false
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
</script>

<h1>See the scores</h1>

<div class="scoreboard-container">
  <div class="scoreboard-wrapper" bind:this={tableContainer}>
    <table>
      <thead>
        <tr>
          <th rowspan="2">Player</th>
          {#each roundResults as round}
            <th colspan="4">Round {round.roundNumber}</th>
          {/each}
        </tr>
        <tr>
          {#each roundResults as _}
            <th>Guess</th>
            <th>Won</th>
            <th>Round</th>
            <th>Score</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each orderedPlayers as player}
          <tr>
            <td>
              <span class="player-cell">
                <span class="player-text">{player}</span>
                <span class="medal"
                  >{getMedal(playerRankings[player] ?? 0, player)}</span
                >
              </span>
            </td>
            {#each roundResults as round}
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
    left: 0;
    background-color: var(--pico-background-color);
    z-index: 2;
  }

  /* Remove .round-data grid styling */
  td {
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  /* Base padding for all cells */
  td,
  th {
    padding: 0.25rem 0.5rem;
  }

  /* Align round headers with their sub-columns */
  th[colspan='4'] {
    text-align: center; /* Align with first sub-column */
  }

  /* Group sub-columns within rounds */
  tr:last-child th {
    /* Sub-headers */
    padding: 0.25rem 0.25rem; /* Tighter padding between sub-columns */
  }
  th:nth-child(4n + 1):not(:first-child) {
    /* First sub-header of each round */
    padding-left: 1rem; /* Add space before each new round */
  }
  /* Add spacing between rounds */
  td:nth-child(4n-1):not(:first-child)  /* First column of each round */ {
    /* First sub-header of each round */
    padding-left: 1rem; /* Add space before each new round */
  }

  /* Make header text uniform height small caps */
  th {
    font-variant-caps: all-small-caps;
    font-size: 0.9rem;
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
</style>

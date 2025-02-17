<script lang="ts">
  import type { GameState } from '$lib/gameState'

  export let currentRound: number
  export let players: string[]
  export let guesses: Record<string, number>
  export let tricks: Record<string, number>
  export let onTrickChange: (player: string, value: number) => void
  export let rounds: GameState['rounds']
  export let onScoreChange: (player: string, score: number) => void

  $: dealerIndex = (currentRound - 1) % players.length
  $: firstPlayerIndex = dealerIndex === players.length - 1 ? 0 : dealerIndex + 1
  $: orderedPlayers = [
    ...players.slice(firstPlayerIndex),
    ...players.slice(0, firstPlayerIndex),
  ]

  // Calculate total tricks for validation
  $: totalTricks = Object.values(tricks).reduce((sum, t) => sum + t, 0)
  $: isValidTotal = totalTricks === currentRound

  function calculateAndSaveScore(player: string): number {
    const guess = guesses[player] ?? 0
    const actual = tricks[player] ?? 0
    const score =
      guess === actual ? 20 + actual * 10 : -10 * Math.abs(guess - actual)

    // Only update score if it has changed
    if (rounds[currentRound - 1]?.scores[player] !== score) {
      onScoreChange(player, score)
    }
    return score
  }

  // Memoize scores to prevent recalculation on every render
  $: playerScores = orderedPlayers.reduce(
    (acc, player) => {
      acc[player] = calculateAndSaveScore(player)
      return acc
    },
    {} as Record<string, number>,
  )
</script>

<h1>Enter results</h1>
<p>Record how many tricks each player won</p>

<div class="status">
  <div class="validation {isValidTotal ? 'success' : 'warning'}">
    {totalTricks} of {currentRound} trick{currentRound === 1 ? '' : 's'} recorded
  </div>
</div>

<div class="players">
  {#each orderedPlayers as player}
    <div class="player-row">
      <div class="player-info">
        <div class="name pico-color-violet-500">{player}</div>
        <div class="guess pico-color-violet-300">
          Guessed <strong>{guesses[player]}</strong>
        </div>
      </div>
      <div class="trick-controls">
        <button
          class="outline"
          on:click={() => onTrickChange(player, (tricks[player] ?? 0) - 1)}
          disabled={tricks[player] === 0}>−</button
        >
        <div class="trick-badge pico-background-violet-600">
          <span class="number">{tricks[player] ?? 0}</span>
          <span class="label">won</span>
        </div>
        <button
          class="outline"
          on:click={() => onTrickChange(player, (tricks[player] ?? 0) + 1)}
          >+</button
        >
      </div>
      <div class="score pico-color-violet-400">
        {(playerScores[player] ?? 0) >= 0 ? '+' : ''}{playerScores[player] ?? 0}
      </div>
    </div>
  {/each}
</div>

<style>
  .players {
    display: grid;
    gap: 0;
    margin-top: 1.5rem;
    border-top: 2px solid rgba(147, 51, 234, 0.2);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .player-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    border-bottom: 2px solid rgba(147, 51, 234, 0.2);
  }

  .player-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .name {
    font-size: 1.2rem;
    font-weight: 500;
  }

  .guess {
    font-size: 0.9rem;
  }

  .trick-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .trick-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: var(--border-radius);
    min-width: 4rem;
  }

  .trick-badge .number {
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 1;
  }

  .trick-badge .label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .score {
    font-size: 1.2rem;
    font-weight: 500;
    min-width: 4rem;
    text-align: right;
  }

  .status {
    height: 3rem;
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }

  .validation {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-size: 0.9rem;
    width: 100%;
    text-align: center;
  }

  .warning {
    background: rgba(147, 51, 234, 0.1);
    color: rgb(147, 51, 234);
  }

  .success {
    background: rgba(52, 211, 153, 0.1);
    color: rgb(52, 211, 153);
  }

  button {
    padding: 0.5rem 1rem;
    min-width: 3rem;
    font-size: 1.2rem;
  }
</style>
